-- Add foreign key constraint between subscriptions and subscription_products
ALTER TABLE public.subscriptions 
ADD CONSTRAINT fk_subscriptions_product_id 
FOREIGN KEY (product_id) REFERENCES public.subscription_products(product_id);