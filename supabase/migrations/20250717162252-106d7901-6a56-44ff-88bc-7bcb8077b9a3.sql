-- Create monthly metrics view (RLS inherited from transactions table)
CREATE OR REPLACE VIEW public.metrics AS
SELECT 
  user_id,
  DATE_TRUNC('month', transaction_date) as month,
  COUNT(*) as total_transactions,
  SUM(gross_robux) as gross_robux,
  SUM(marketplace_cut) as roblox_cut_robux,
  SUM(COALESCE(ad_spend, 0)) as ad_spend_robux,
  SUM(net_robux) as net_robux,
  SUM(net_usd) as net_usd,
  AVG(devex_rate) as avg_devex_rate
FROM public.transactions
GROUP BY user_id, DATE_TRUNC('month', transaction_date)
ORDER BY month DESC;

-- Attach the calculate_transaction_usd trigger to transactions table
CREATE TRIGGER calculate_transaction_usd_trigger
BEFORE INSERT OR UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.calculate_transaction_usd();