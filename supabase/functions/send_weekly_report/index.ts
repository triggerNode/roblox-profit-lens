import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

    console.log('[SEND-WEEKLY-REPORT] Starting weekly report generation');

    // Get all active subscribers who want weekly reports
    const { data: subscribers, error: subscribersError } = await supabase
      .from('subscriptions')
      .select(`
        user_id,
        product_id,
        status,
        profiles!inner(email, full_name),
        user_settings!inner(email_weekly_reports)
      `)
      .eq('status', 'active')
      .eq('user_settings.email_weekly_reports', true);

    if (subscribersError) {
      console.error('Error fetching subscribers:', subscribersError);
      throw new Error('Failed to fetch subscribers');
    }

    if (!subscribers || subscribers.length === 0) {
      console.log('[SEND-WEEKLY-REPORT] No subscribers found for weekly reports');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No subscribers to send reports to',
        reportsSent: 0
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[SEND-WEEKLY-REPORT] Found ${subscribers.length} subscribers for weekly reports`);

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    let reportsSent = 0;

    // Process each subscriber
    for (const subscriber of subscribers) {
      try {
        // Get last week's metrics
        const { data: thisWeekMetrics, error: thisWeekError } = await supabase
          .from('transactions')
          .select('net_usd, gross_robux, ad_spend')
          .eq('user_id', subscriber.user_id)
          .gte('transaction_date', oneWeekAgo.toISOString())
          .not('demo_data', 'eq', true);

        if (thisWeekError) {
          console.error(`Error fetching this week's metrics for user ${subscriber.user_id}:`, thisWeekError);
          continue;
        }

        // Get previous week's metrics for comparison
        const { data: lastWeekMetrics, error: lastWeekError } = await supabase
          .from('transactions')
          .select('net_usd, gross_robux, ad_spend')
          .eq('user_id', subscriber.user_id)
          .gte('transaction_date', twoWeeksAgo.toISOString())
          .lt('transaction_date', oneWeekAgo.toISOString())
          .not('demo_data', 'eq', true);

        if (lastWeekError) {
          console.error(`Error fetching last week's metrics for user ${subscriber.user_id}:`, lastWeekError);
          continue;
        }

        // Calculate totals
        const thisWeekTotal = thisWeekMetrics?.reduce((sum, t) => sum + t.net_usd, 0) || 0;
        const lastWeekTotal = lastWeekMetrics?.reduce((sum, t) => sum + t.net_usd, 0) || 0;
        const thisWeekRobux = thisWeekMetrics?.reduce((sum, t) => sum + t.gross_robux, 0) || 0;
        const thisWeekAdSpend = thisWeekMetrics?.reduce((sum, t) => sum + (t.ad_spend || 0), 0) || 0;

        // Calculate week-over-week change
        const weekOverWeekChange = lastWeekTotal > 0 ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100 : 0;
        const changeDirection = weekOverWeekChange >= 0 ? 'up' : 'down';
        const changeEmoji = weekOverWeekChange >= 0 ? '📈' : '📉';

        // Skip if no activity this week
        if (thisWeekTotal === 0 && thisWeekRobux === 0) {
          console.log(`[SEND-WEEKLY-REPORT] No activity for user ${subscriber.user_id}, skipping`);
          continue;
        }

        // Determine upgrade CTA based on plan
        const isEarlyBird = subscriber.product_id === 'early_bird';
        const upgradeCTA = isEarlyBird ? 
          'Upgrade to Growth plan for unlimited games and advanced analytics!' : 
          '';

        // Send email
        const emailResponse = await resend.emails.send({
          from: "Roblox Profit <reports@robloxprofit.com>",
          to: [subscriber.profiles.email],
          subject: `${changeEmoji} Your Weekly Roblox Profit Report`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #333; margin-bottom: 20px;">📊 Weekly Profit Report</h1>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="color: #333; margin-top: 0;">Last Week's Performance</h2>
                <div style="font-size: 32px; font-weight: bold; color: #28a745; margin: 10px 0;">
                  $${thisWeekTotal.toFixed(2)}
                </div>
                <p style="color: #666; margin: 5px 0;">
                  Net USD Revenue ${changeDirection} ${Math.abs(weekOverWeekChange).toFixed(1)}% from last week
                </p>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
                <div style="background: #e3f2fd; padding: 15px; border-radius: 6px; text-align: center;">
                  <div style="font-size: 18px; font-weight: bold; color: #1976d2;">
                    R$ ${thisWeekRobux.toLocaleString()}
                  </div>
                  <div style="font-size: 12px; color: #666;">Gross Robux</div>
                </div>
                <div style="background: #fff3e0; padding: 15px; border-radius: 6px; text-align: center;">
                  <div style="font-size: 18px; font-weight: bold; color: #f57c00;">
                    $${thisWeekAdSpend.toFixed(2)}
                  </div>
                  <div style="font-size: 12px; color: #666;">Ad Spend</div>
                </div>
              </div>

              ${upgradeCTA ? `
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                  <h3 style="color: white; margin: 0 0 10px 0;">🚀 Ready to Scale Up?</h3>
                  <p style="color: white; margin: 0 0 15px 0;">${upgradeCTA}</p>
                  <a href="${Deno.env.get('SUPABASE_URL')}/pricing" style="background: white; color: #667eea; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    View Pricing
                  </a>
                </div>
              ` : ''}

              <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px; text-align: center;">
                <p style="color: #666; font-size: 12px; margin: 0;">
                  Want to change your email preferences? 
                  <a href="${Deno.env.get('SUPABASE_URL')}/settings" style="color: #667eea;">Update settings</a>
                </p>
              </div>
            </div>
          `,
        });

        if (emailResponse.error) {
          console.error(`Failed to send email to ${subscriber.profiles.email}:`, emailResponse.error);
        } else {
          console.log(`[SEND-WEEKLY-REPORT] Successfully sent report to ${subscriber.profiles.email}`);
          reportsSent++;
        }

      } catch (error) {
        console.error(`Error processing subscriber ${subscriber.user_id}:`, error);
      }
    }

    console.log(`[SEND-WEEKLY-REPORT] Completed weekly report generation. Sent ${reportsSent} reports`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Weekly reports sent successfully',
      reportsSent: reportsSent,
      totalSubscribers: subscribers.length
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in send_weekly_report function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);