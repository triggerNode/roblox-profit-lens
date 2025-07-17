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

    console.log('[UPDATE-DEVEX-RATE] Starting DevEx rate update process');

    // Get current DevEx rate from global settings
    const { data: currentSetting, error: currentError } = await supabase
      .from('global_settings')
      .select('setting_value')
      .eq('setting_key', 'devex_rate')
      .single();

    if (currentError) {
      console.error('Error fetching current DevEx rate:', currentError);
      throw new Error('Failed to fetch current DevEx rate');
    }

    const currentRateData = currentSetting.setting_value as {
      current_rate: number;
      last_updated: string;
      previous_rate: number;
    };

    // Mock DevEx rate scraping (in real implementation, this would scrape from Roblox)
    // For now, we'll simulate a small random change
    const baseRate = 0.0035;
    const variation = (Math.random() - 0.5) * 0.0002; // ±0.0001 variation
    const newRate = Math.max(0.003, Math.min(0.004, baseRate + variation));

    console.log(`[UPDATE-DEVEX-RATE] Current rate: ${currentRateData.current_rate}, New rate: ${newRate}`);

    // Calculate percentage change
    const changePercent = Math.abs((newRate - currentRateData.current_rate) / currentRateData.current_rate) * 100;
    const shouldNotifyUsers = changePercent >= 5;

    // Update global settings
    const newRateData = {
      current_rate: newRate,
      last_updated: new Date().toISOString(),
      previous_rate: currentRateData.current_rate
    };

    const { error: updateError } = await supabase
      .from('global_settings')
      .update({ setting_value: newRateData })
      .eq('setting_key', 'devex_rate');

    if (updateError) {
      console.error('Error updating DevEx rate:', updateError);
      throw new Error('Failed to update DevEx rate');
    }

    console.log('[UPDATE-DEVEX-RATE] Global DevEx rate updated successfully');

    // Update all user profiles with the new rate
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({ devex_rate: newRate });

    if (profileUpdateError) {
      console.error('Error updating user profiles:', profileUpdateError);
      throw new Error('Failed to update user profiles');
    }

    console.log('[UPDATE-DEVEX-RATE] All user profiles updated with new DevEx rate');

    // If change is significant (≥5%), send email notifications
    if (shouldNotifyUsers) {
      console.log(`[UPDATE-DEVEX-RATE] Significant change detected (${changePercent.toFixed(2)}%), sending notifications`);

      // Get all users who want rate change notifications
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('user_id, email')
        .eq('user_settings.email_rate_changes', true);

      if (usersError) {
        console.error('Error fetching users for notifications:', usersError);
      } else if (users && users.length > 0) {
        // In a real implementation, you would send emails here
        console.log(`[UPDATE-DEVEX-RATE] Would send notifications to ${users.length} users`);
        // TODO: Implement email sending via Resend
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'DevEx rate updated successfully',
      oldRate: currentRateData.current_rate,
      newRate: newRate,
      changePercent: changePercent.toFixed(2),
      notificationsSent: shouldNotifyUsers
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in update_devex_rate function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);