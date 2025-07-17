-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  product_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscription products table
CREATE TABLE public.subscription_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  stripe_price_id TEXT,
  trial_period_days INTEGER DEFAULT 0,
  metadata JSONB,
  inventory_limit INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscription usage tracking table
CREATE TABLE public.subscription_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT UNIQUE NOT NULL,
  checkouts_count INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscriptions
CREATE POLICY "Users can view their own subscriptions" 
ON public.subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" 
ON public.subscriptions 
FOR ALL 
USING (true);

-- Create RLS policies for subscription products (public read)
CREATE POLICY "Anyone can view subscription products" 
ON public.subscription_products 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage subscription products" 
ON public.subscription_products 
FOR ALL 
USING (true);

-- Create RLS policies for subscription usage (public read)
CREATE POLICY "Anyone can view subscription usage" 
ON public.subscription_usage 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage subscription usage" 
ON public.subscription_usage 
FOR ALL 
USING (true);

-- Insert initial subscription products
INSERT INTO public.subscription_products (product_id, name, price, trial_period_days, metadata, inventory_limit) VALUES
('early_bird', 'Early-Bird', 900, 0, '{"max_games": 1, "retention_days": 30}'::jsonb, 100),
('growth', 'Growth', 2900, 7, '{"max_games": 3, "retention_days": 365, "auto_sync": "daily"}'::jsonb, NULL),
('studio', 'Studio', 7900, 7, '{"max_games": "unlimited", "seats": 5, "auto_sync": "realtime"}'::jsonb, NULL);

-- Insert initial usage tracking
INSERT INTO public.subscription_usage (product_id, checkouts_count) VALUES
('early_bird', 0),
('growth', 0),
('studio', 0);

-- Create triggers for updated_at
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscription_products_updated_at
BEFORE UPDATE ON public.subscription_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscription_usage_updated_at
BEFORE UPDATE ON public.subscription_usage
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();