-- Fix subscription dates to make the subscription active
UPDATE subscriptions 
SET 
  current_period_start = '2025-07-17 00:00:00+00',
  current_period_end = '2026-01-17 00:00:00+00'
WHERE user_id = 'd7c9df37-4e7e-4add-86da-2767d639fff9' AND id = '2881d58f-5528-4ff3-9127-3621f45e15bf';