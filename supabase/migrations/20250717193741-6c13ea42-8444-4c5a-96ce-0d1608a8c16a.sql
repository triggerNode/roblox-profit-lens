-- Create global_settings table for DevEx rate and other global settings
CREATE TABLE public.global_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for global_settings
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read global settings
CREATE POLICY "Anyone can view global settings" 
ON public.global_settings 
FOR SELECT 
USING (true);

-- Only service role can manage global settings
CREATE POLICY "Service role can manage global settings" 
ON public.global_settings 
FOR ALL 
USING (true);

-- Insert initial DevEx rate setting
INSERT INTO public.global_settings (setting_key, setting_value)
VALUES ('devex_rate', '{"current_rate": 0.0035, "last_updated": "2025-01-17T00:00:00Z", "previous_rate": 0.0035}');

-- Add demo_data and expiry columns to transactions table
ALTER TABLE public.transactions 
ADD COLUMN demo_data BOOLEAN DEFAULT false,
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE NULL;

-- Add trigger for automatic updated_at on global_settings
CREATE TRIGGER update_global_settings_updated_at
BEFORE UPDATE ON public.global_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add email preferences to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN email_weekly_reports BOOLEAN DEFAULT true,
ADD COLUMN email_rate_changes BOOLEAN DEFAULT true;