import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEAT-COUNTER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Seat counter request received");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get active subscriptions count for early_bird
    const { data: earlyBirdSubs, error: earlyBirdError } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("product_id", "early_bird")
      .eq("status", "active");

    if (earlyBirdError) {
      throw new Error(`Failed to fetch early bird subscriptions: ${earlyBirdError.message}`);
    }

    // Get early bird product details for inventory limit
    const { data: earlyBirdProduct, error: productError } = await supabase
      .from("subscription_products")
      .select("inventory_limit")
      .eq("product_id", "early_bird")
      .single();

    if (productError) {
      throw new Error(`Failed to fetch early bird product: ${productError.message}`);
    }

    const currentSeats = earlyBirdSubs?.length || 0;
    const maxSeats = earlyBirdProduct?.inventory_limit || 100;
    const remainingSeats = Math.max(0, maxSeats - currentSeats);

    // Get all plan seat counts (excluding lifetime plans)
    const { data: allSubs, error: allSubsError } = await supabase
      .from("subscriptions")
      .select("product_id")
      .eq("status", "active")
      .neq("product_id", "lifetime_pro");

    if (allSubsError) {
      throw new Error(`Failed to fetch all subscriptions: ${allSubsError.message}`);
    }

    const seatCounts = {
      early_bird: currentSeats,
      growth: allSubs?.filter(sub => sub.product_id === "growth").length || 0,
      studio: allSubs?.filter(sub => sub.product_id === "studio").length || 0,
    };

    const responseData = {
      early_bird: {
        current: currentSeats,
        max: maxSeats,
        remaining: remainingSeats,
        available: remainingSeats > 0,
      },
      seat_counts: seatCounts,
    };

    logStep("Seat counter data", responseData);

    return new Response(
      JSON.stringify(responseData),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});