-- Remove Telegram-related columns (feature deferred)
ALTER TABLE users DROP COLUMN IF EXISTS telegram_chat_id;
ALTER TABLE users DROP COLUMN IF EXISTS notify_telegram;
ALTER TABLE daily_horoscopes DROP COLUMN IF EXISTS sent_tg;
