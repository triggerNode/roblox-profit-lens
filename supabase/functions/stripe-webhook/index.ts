import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");
    
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const signature = req.headers.get("stripe-signature");
    const body = await req.text();
    
    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
      );
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err.message });
      return new Response("Webhook signature verification failed", { status: 400 });
    }

    logStep("Event type", { type: event.type });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout session completed", { sessionId: session.id });

        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          
          const customer = await stripe.customers.retrieve(
            subscription.customer as string
          );
          
          if (customer.deleted) {
            throw new Error("Customer was deleted");
          }

          const customerEmail = customer.email;
          if (!customerEmail) {
            throw new Error("Customer email not found");
          }

          // Get user by email
          const { data: authUser } = await supabase.auth.admin.getUserByEmail(customerEmail);
          if (!authUser.user) {
            throw new Error(`User not found for email: ${customerEmail}`);
          }

          // Get product info from line items
          const lineItem = session.line_items?.data[0];
          if (!lineItem?.price?.id) {
            throw new Error("No price ID found in session");
          }

          const price = await stripe.prices.retrieve(lineItem.price.id);
          const productId = await getProductIdFromStripePrice(supabase, price.id);

          // Update subscription in database
          const { error: upsertError } = await supabase
            .from("subscriptions")
            .upsert({
              user_id: authUser.user.id,
              stripe_customer_id: subscription.customer as string,
              stripe_subscription_id: subscription.id,
              product_id: productId,
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            });

          if (upsertError) {
            throw new Error(`Failed to upsert subscription: ${upsertError.message}`);
          }

          // Update usage tracking for early_bird
          if (productId === "early_bird") {
            const { error: usageError } = await supabase
              .from("subscription_usage")
              .upsert({
                product_id: "early_bird",
                checkouts_count: 1,
                last_updated: new Date().toISOString(),
              }, {
                onConflict: "product_id"
              });

            if (usageError) {
              logStep("Failed to update usage tracking", { error: usageError.message });
            }
          }

          logStep("Subscription created successfully", { userId: authUser.user.id, productId });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription updated/deleted", { subscriptionId: subscription.id });

        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (updateError) {
          throw new Error(`Failed to update subscription: ${updateError.message}`);
        }

        logStep("Subscription updated successfully");
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
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

async function getProductIdFromStripePrice(supabase: any, stripePriceId: string): Promise<string> {
  const { data, error } = await supabase
    .from("subscription_products")
    .select("product_id")
    .eq("stripe_price_id", stripePriceId)
    .single();

  if (error || !data) {
    throw new Error(`Product not found for price ID: ${stripePriceId}`);
  }

  return data.product_id;
}