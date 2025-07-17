-- Create a lifetime subscription product
INSERT INTO public.subscription_products (
  name,
  product_id,
  price,
  trial_period_days,
  metadata,
  inventory_limit,
  is_active,
  stripe_price_id
) VALUES (
  'Lifetime Pro',
  'lifetime_pro',
  0,
  0,
  '{"type": "lifetime", "features": {"max_games": "unlimited", "retention_days": 9999, "auto_sync": "enabled", "seats": 999}}',
  NULL,
  true,
  'lifetime_pro'
) ON CONFLICT (product_id) DO NOTHING;

-- Create a lifetime subscription for boothpod@gmail.com
INSERT INTO public.subscriptions (
  user_id,
  product_id,
  status,
  current_period_start,
  current_period_end,
  trial_end,
  cancel_at_period_end,
  stripe_customer_id,
  stripe_subscription_id
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'boothpod@gmail.com'),
  'lifetime_pro',
  'active',
  now(),
  '2099-12-31 23:59:59+00',
  NULL,
  false,
  'lifetime_customer',
  'lifetime_subscription'
) ON CONFLICT (user_id, product_id) DO UPDATE SET
  status = 'active',
  current_period_end = '2099-12-31 23:59:59+00',
  cancel_at_period_end = false;