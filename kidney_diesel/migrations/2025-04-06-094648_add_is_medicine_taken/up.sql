-- Your SQL goes here
ALTER TABLE user_take_medicines
ADD COLUMN IF NOT EXISTS is_medicine_taken BOOL DEFAULT FALSE;