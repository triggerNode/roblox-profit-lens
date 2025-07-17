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
) 
SELECT 
  'Lifetime Pro',
  'lifetime_pro',
  0,
  0,
  '{"type": "lifetime", "features": {"max_games": "unlimited", "retention_days": 9999, "auto_sync": "enabled", "seats": 999}}',
  NULL,
  true,
  'lifetime_pro'
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscription_products WHERE product_id = 'lifetime_pro'
);

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
) 
SELECT 
  u.id,
  'lifetime_pro',
  'active',
  now(),
  '2099-12-31 23:59:59+00',
  NULL,
  false,
  'lifetime_customer',
  'lifetime_subscription'
FROM auth.users u
WHERE u.email = 'boothpod@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.subscriptions s 
    WHERE s.user_id = u.id AND s.product_id = 'lifetime_pro'
  );