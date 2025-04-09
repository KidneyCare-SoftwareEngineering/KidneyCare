-- This file should undo anything in `up.sql`
ALTER TABLE user_take_medicines
ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(user_id);