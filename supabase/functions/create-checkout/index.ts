import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

interface CheckoutRequest {
  product_id: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Checkout request received");

    const { product_id }: CheckoutRequest = await req.json();
    
    if (!product_id) {
      throw new Error("Product ID is required");
    }

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
    
    if (authError || !user?.email) {
      throw new Error("User not authenticated");
    }

    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get product details
    const { data: product, error: productError } = await supabase
      .from("subscription_products")
      .select("*")
      .eq("product_id", product_id)
      .eq("is_active", true)
      .single();

    if (productError || !product) {
      throw new Error(`Product not available for checkout: ${product_id}`);
    }

    // Check if early_bird and if sold out
    if (product_id === "early_bird") {
      const { data: usage } = await supabase
        .from("subscription_usage")
        .select("checkouts_count")
        .eq("product_id", "early_bird")
        .single();

      const checkouts = usage?.checkouts_count || 0;
      if (checkouts >= (product.inventory_limit || 100)) {
        throw new Error("Early Bird plan is sold out");
      }
    }

    logStep("Product validated", { productId: product_id, price: product.price });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("Creating new customer");
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              metadata: {
                product_id: product_id,
              },
            },
            unit_amount: product.price,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/pricing`,
      metadata: {
        user_id: user.id,
        product_id: product_id,
      },
      subscription_data: {
        trial_period_days: product.trial_period_days || undefined,
        metadata: {
          user_id: user.id,
          product_id: product_id,
        },
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(
      JSON.stringify({ url: session.url }),
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