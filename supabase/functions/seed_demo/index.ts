import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid user' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[SEED-DEMO] Creating demo data for user: ${user.id}`);

    // Clear existing demo data for this user
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('user_id', user.id)
      .eq('demo_data', true);

    if (deleteError) {
      console.error('Error deleting existing demo data:', deleteError);
      throw new Error('Failed to clear existing demo data');
    }

    // Generate 30 realistic demo transactions
    const demoTransactions = [];
    const itemNames = [
      'Premium Sword', 'Magic Staff', 'Dragon Armor', 'Speed Potion', 'Health Pack',
      'VIP Access', 'Gold Coins', 'Rare Pet', 'Power Boost', 'Shield Upgrade',
      'Fire Spell', 'Ice Spell', 'Lightning Bolt', 'Healing Potion', 'Mana Potion',
      'Diamond Ring', 'Crystal Gem', 'Ancient Scroll', 'Mystic Orb', 'Epic Mount'
    ];

    const sources = ['GamePass', 'DevProduct', 'UGC', 'PremiumPayout'];
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    for (let i = 0; i < 30; i++) {
      const grossRobux = Math.floor(Math.random() * 1000) + 100; // 100-1100 Robux
      const adSpend = Math.random() > 0.7 ? Math.floor(Math.random() * 50) + 10 : 0; // 30% chance of ad spend
      const transactionDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Last 30 days
      
      demoTransactions.push({
        user_id: user.id,
        source: sources[Math.floor(Math.random() * sources.length)],
        item_name: itemNames[Math.floor(Math.random() * itemNames.length)],
        item_type: sources[Math.floor(Math.random() * sources.length)] as any,
        gross_robux: grossRobux,
        transaction_date: transactionDate.toISOString().split('T')[0],
        ad_spend: adSpend,
        devex_rate: 0.0035,
        demo_data: true,
        expires_at: expiresAt.toISOString()
      });
    }

    // Insert demo transactions
    const { error: insertError } = await supabase
      .from('transactions')
      .insert(demoTransactions);

    if (insertError) {
      console.error('Error inserting demo transactions:', insertError);
      throw new Error('Failed to create demo data');
    }

    console.log(`[SEED-DEMO] Successfully created ${demoTransactions.length} demo transactions`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Demo data created successfully',
      transactionCount: demoTransactions.length,
      expiresAt: expiresAt.toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in seed_demo function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);