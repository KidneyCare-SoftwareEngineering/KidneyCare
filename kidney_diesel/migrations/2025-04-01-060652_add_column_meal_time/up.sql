-- Your SQL goes here
-- make ALTER TABLE meal_plan_recipes ADD COLUMN meal_time INTEGER; but if the column already exists, do nothing
ALTER TABLE meal_plan_recipes
ADD COLUMN IF NOT EXISTS meal_time INTEGER;