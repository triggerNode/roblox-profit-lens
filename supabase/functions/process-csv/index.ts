import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Transaction {
  date: string;
  source: string;
  item: string;
  robux: string;
}

interface ProcessedTransaction {
  transaction_date: string;
  source: string;
  item_name: string;
  item_type: string;
  gross_robux: number;
  ad_spend: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Get the user from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { csvData, filename } = await req.json();

    if (!csvData || !Array.isArray(csvData)) {
      return new Response(
        JSON.stringify({ error: 'Invalid CSV data' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Processing CSV for user ${user.id}, filename: ${filename}`);

    // Create upload record
    const { data: upload, error: uploadError } = await supabaseClient
      .from('uploads')
      .insert({
        user_id: user.id,
        filename: filename,
        total_transactions: csvData.length,
        processing_status: 'processing'
      })
      .select()
      .single();

    if (uploadError) {
      console.error('Error creating upload record:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to create upload record' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Process each transaction
    const processedTransactions: ProcessedTransaction[] = [];
    
    for (const row of csvData) {
      try {
        const transaction = row as Transaction;
        
        // Parse and validate the transaction
        if (!transaction.date || !transaction.source || !transaction.item || !transaction.robux) {
          console.warn('Skipping invalid transaction:', transaction);
          continue;
        }

        const robuxAmount = parseFloat(transaction.robux.replace(/[^0-9.-]/g, ''));
        if (isNaN(robuxAmount)) {
          console.warn('Invalid robux amount:', transaction.robux);
          continue;
        }

        // Determine item type and ad spend based on source
        let itemType = 'Other';
        let adSpend = 0;

        if (transaction.source.toLowerCase().includes('gamepass')) {
          itemType = 'GamePass';
        } else if (transaction.source.toLowerCase().includes('devproduct')) {
          itemType = 'DevProduct';
        } else if (transaction.source.toLowerCase().includes('ugc')) {
          itemType = 'UGC';
        } else if (transaction.source.toLowerCase().includes('premium')) {
          itemType = 'PremiumPayout';
        }

        // Extract ad spend if present in item name
        const adSpendMatch = transaction.item.match(/ad[:\s]*[\$]?(\d+(?:\.\d{2})?)/i);
        if (adSpendMatch) {
          adSpend = parseFloat(adSpendMatch[1]);
        }

        processedTransactions.push({
          transaction_date: transaction.date,
          source: transaction.source,
          item_name: transaction.item,
          item_type: itemType,
          gross_robux: robuxAmount,
          ad_spend: adSpend
        });

      } catch (error) {
        console.error('Error processing transaction:', error);
        continue;
      }
    }

    // Insert processed transactions
    const { error: insertError } = await supabaseClient
      .from('transactions')
      .insert(
        processedTransactions.map(t => ({
          user_id: user.id,
          upload_id: upload.id,
          ...t
        }))
      );

    if (insertError) {
      console.error('Error inserting transactions:', insertError);
      
      // Update upload status to failed
      await supabaseClient
        .from('uploads')
        .update({ 
          processing_status: 'failed',
          error_message: insertError.message
        })
        .eq('id', upload.id);

      return new Response(
        JSON.stringify({ error: 'Failed to insert transactions' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update upload status to completed
    await supabaseClient
      .from('uploads')
      .update({ 
        processing_status: 'completed',
        total_transactions: processedTransactions.length
      })
      .eq('id', upload.id);

    console.log(`Successfully processed ${processedTransactions.length} transactions`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processedCount: processedTransactions.length,
        uploadId: upload.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in process-csv function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});