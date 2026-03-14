-- Rename lemon_squeezy_id → paddle_subscription_id (payment processor switch)
ALTER TABLE subscriptions RENAME COLUMN lemon_squeezy_id TO paddle_subscription_id;
