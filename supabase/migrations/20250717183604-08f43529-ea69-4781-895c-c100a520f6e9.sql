-- Set Lifetime Pro product as inactive to hide it from public pricing page
UPDATE public.subscription_products 
SET is_active = false 
WHERE product_id = 'lifetime_pro';