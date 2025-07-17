import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Check subscription request started");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`);
    }

    const user = userData.user;
    if (!user) {
      throw new Error("User not authenticated");
    }

    logStep("User authenticated", { userId: user.id });

    // Get user's subscription
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select(`
        *,
        subscription_products (
          name,
          metadata,
          inventory_limit
        )
      `)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (subError) {
      throw new Error(`Failed to fetch subscription: ${subError.message}`);
    }

    if (!subscription) {
      logStep("No active subscription found");
      return new Response(JSON.stringify({
        hasActiveSubscription: false,
        subscription: null,
        planFeatures: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const planFeatures = subscription.subscription_products?.metadata || {};
    
    logStep("Active subscription found", { 
      productId: subscription.product_id,
      status: subscription.status,
      features: planFeatures
    });

    return new Response(JSON.stringify({
      hasActiveSubscription: true,
      subscription: {
        id: subscription.id,
        product_id: subscription.product_id,
        status: subscription.status,
        current_period_end: subscription.current_period_end,
        trial_end: subscription.trial_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        plan_name: subscription.subscription_products?.name,
      },
      planFeatures,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});