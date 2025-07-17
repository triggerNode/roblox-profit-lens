-- Remove Lifetime Pro completely and switch user to Growth plan
-- First, update the existing subscription to use 'growth' instead of 'lifetime_pro'
UPDATE public.subscriptions 
SET product_id = 'growth'
WHERE product_id = 'lifetime_pro';

-- Then, delete the lifetime_pro product completely
DELETE FROM public.subscription_products 
WHERE product_id = 'lifetime_pro';

-- Update the subscription with proper Growth plan details
-- Setting a realistic period end date and removing trial_end since it's not a trial
UPDATE public.subscriptions 
SET 
  status = 'active',
  current_period_start = '2025-01-17T00:00:00+00:00',
  current_period_end = '2025-02-17T00:00:00+00:00',
  trial_end = NULL,
  cancel_at_period_end = false,
  updated_at = now()
WHERE product_id = 'growth';