import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Transaction {
  date: string;
  source: string;
  item: string;
  robux: number;
  adSpend?: number;
}

interface ProcessedTransaction {
  user_id: string;
  transaction_date: string;
  source: string;
  item_name: string;
  item_type: string;
  gross_robux: number;
  ad_spend: number;
  devex_rate: number;
  upload_id: string;
}

// Enhanced ad spend detection
function extractAdSpend(transaction: Transaction): number {
  // Check if ad spend is explicitly provided
  if (transaction.adSpend !== undefined) {
    return transaction.adSpend;
  }
  
  // Extract from source (e.g., "Roblox Ads: $5.00")
  const adSpendMatch = transaction.source.match(/ads?.*?[\$:]?\s*(\d+\.?\d*)/i);
  if (adSpendMatch) {
    return parseFloat(adSpendMatch[1]);
  }
  
  // Extract from item name (e.g., "Premium Item (Ad: $3.50)")
  const itemAdMatch = transaction.item.match(/ad.*?[\$:]?\s*(\d+\.?\d*)/i);
  if (itemAdMatch) {
    return parseFloat(itemAdMatch[1]);
  }
  
  return 0;
}

// Enhanced item type detection
function detectItemType(item: string, source: string): string {
  const itemLower = item.toLowerCase();
  const sourceLower = source.toLowerCase();
  
  if (itemLower.includes('gamepass') || sourceLower.includes('gamepass')) {
    return 'GamePass';
  }
  if (itemLower.includes('devproduct') || sourceLower.includes('devproduct')) {
    return 'DevProduct';
  }
  if (itemLower.includes('ugc') || sourceLower.includes('ugc')) {
    return 'UGC';
  }
  if (itemLower.includes('premium') || sourceLower.includes('premium')) {
    return 'PremiumPayout';
  }
  
  return 'Other';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the authorization header
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

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { csvData, filename } = await req.json();

    if (!csvData || !Array.isArray(csvData)) {
      return new Response(
        JSON.stringify({ error: 'Invalid CSV data format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Processing ${csvData.length} transactions for user ${user.id}`);

    // Create upload record
    const { data: uploadData, error: uploadError } = await supabase
      .from('uploads')
      .insert({
        user_id: user.id,
        filename: filename || 'unknown.csv',
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

    // Get user's DevEx rate
    const { data: profile } = await supabase
      .from('profiles')
      .select('devex_rate')
      .eq('user_id', user.id)
      .single();

    const devexRate = profile?.devex_rate || 0.0035;

    // Process CSV data
    const processedTransactions: ProcessedTransaction[] = [];
    const errors: string[] = [];

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      
      try {
        // Expected format: Date, Source, Item, Robux
        const transaction: Transaction = {
          date: row.Date || row.date,
          source: row.Source || row.source,
          item: row.Item || row.item,
          robux: parseFloat(row.Robux || row.robux || '0'),
          adSpend: row.AdSpend || row.adSpend || row['Ad Spend']
        };

        // Validate required fields
        if (!transaction.date || !transaction.source || !transaction.item) {
          errors.push(`Row ${i + 1}: Missing required fields`);
          continue;
        }

        if (isNaN(transaction.robux) || transaction.robux <= 0) {
          errors.push(`Row ${i + 1}: Invalid Robux amount`);
          continue;
        }

        // Parse date
        const transactionDate = new Date(transaction.date);
        if (isNaN(transactionDate.getTime())) {
          errors.push(`Row ${i + 1}: Invalid date format`);
          continue;
        }

        // Extract ad spend and detect item type
        const adSpend = extractAdSpend(transaction);
        const itemType = detectItemType(transaction.item, transaction.source);

        const processedTransaction: ProcessedTransaction = {
          user_id: user.id,
          transaction_date: transactionDate.toISOString().split('T')[0],
          source: transaction.source,
          item_name: transaction.item,
          item_type: itemType,
          gross_robux: transaction.robux,
          ad_spend: adSpend,
          devex_rate: devexRate,
          upload_id: uploadData.id
        };

        processedTransactions.push(processedTransaction);
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      console.warn('Processing errors:', errors);
    }

    // Insert transactions
    if (processedTransactions.length > 0) {
      const { error: insertError } = await supabase
        .from('transactions')
        .insert(processedTransactions);

      if (insertError) {
        console.error('Error inserting transactions:', insertError);
        
        // Update upload record with error
        await supabase
          .from('uploads')
          .update({
            processing_status: 'failed',
            error_message: insertError.message
          })
          .eq('id', uploadData.id);

        return new Response(
          JSON.stringify({ error: 'Failed to insert transactions' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Update upload record with success
    await supabase
      .from('uploads')
      .update({
        processing_status: 'completed',
        total_transactions: processedTransactions.length
      })
      .eq('id', uploadData.id);

    console.log(`Successfully processed ${processedTransactions.length} transactions`);

    return new Response(
      JSON.stringify({ 
        message: 'CSV processed successfully',
        processed_count: processedTransactions.length,
        error_count: errors.length,
        errors: errors.slice(0, 10), // Return first 10 errors
        upload_id: uploadData.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});