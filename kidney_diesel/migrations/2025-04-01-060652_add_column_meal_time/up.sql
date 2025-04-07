-- Your SQL goes here
ALTER TABLE meal_plan_recipes
ADD COLUMN IF NOT EXISTS meal_time INTEGER;