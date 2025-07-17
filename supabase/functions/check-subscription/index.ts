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
    logStep("Subscription check started");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    logStep("User authenticated", { userId: user.id });

    // Get user's subscription
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select(`
        *,
        subscription_products!inner(
          name,
          metadata
        )
      `)
      .eq("user_id", user.id)
      .in("status", ["active", "trialing"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (subError && subError.code !== "PGRST116") {
      logStep("Database error", { error: subError });
      throw new Error("Failed to fetch subscription");
    }

    if (!subscription) {
      logStep("No active subscription found");
      return new Response(
        JSON.stringify({
          subscription: null,
          planFeatures: null,
          hasActiveSubscription: false,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Check if subscription is actually active (not expired)
    const now = new Date();
    const periodEnd = new Date(subscription.current_period_end);
    const trialEnd = subscription.trial_end ? new Date(subscription.trial_end) : null;
    
    const isActive = subscription.status === "active" && periodEnd > now;
    const isTrialing = subscription.status === "trialing" && trialEnd && trialEnd > now;
    const hasActiveSubscription = isActive || isTrialing;

    logStep("Subscription status checked", { 
      status: subscription.status,
      isActive,
      isTrialing,
      hasActiveSubscription,
      periodEnd: periodEnd.toISOString(),
      trialEnd: trialEnd?.toISOString()
    });

    // Get plan features from metadata
    const planFeatures = subscription.subscription_products?.metadata || {};

    // Calculate trial days remaining
    let trialDaysRemaining = 0;
    if (isTrialing && trialEnd) {
      trialDaysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    const responseData = {
      subscription: {
        id: subscription.id,
        product_id: subscription.product_id,
        status: subscription.status,
        current_period_end: subscription.current_period_end,
        trial_end: subscription.trial_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        plan_name: subscription.subscription_products?.name || "Unknown Plan",
        trial_days_remaining: trialDaysRemaining,
      },
      planFeatures,
      hasActiveSubscription,
    };

    logStep("Returning subscription data", responseData);

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