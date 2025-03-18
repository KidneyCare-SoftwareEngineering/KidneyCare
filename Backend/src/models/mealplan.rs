use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct MealPlanRequest {
    pub data: UserMealRequest,
}

#[derive(Deserialize)]
pub struct UserMealRequest {
    pub u_id: String,
    pub days: u32,
}

#[derive(Deserialize, Serialize)]
pub struct UpdateMealPlanRequest {
    pub user_id: String,
    pub days: i32,
    pub mealplans: Vec<Vec<serde_json::Value>>, // Keeping mealplans as generic JSON
}

#[derive(Deserialize, Serialize)]
pub struct UpdateMealPlanRequestWithoutDays {
    pub user_id: String,
    pub mealplans: Vec<Vec<serde_json::Value>>, // Keeping mealplans as generic JSON
}

#[derive(Serialize)]
pub struct UpdateMealPlanResponse {
    pub user_line_id: String,
    pub days: i32,
    pub nutrition_limit_per_day: NutritionLimit,
    pub food_menus: Vec<FoodMenu>,
    pub mealplan: UpdateMealPlanRequestWithoutDays,
}

#[derive(Serialize)]
pub struct FoodMenu {
    pub name: String,
    pub nutrition: Nutrition,
    pub recipe_id: String,
    // pub recipe_img_link: String,
    pub recipe_img_link: Vec<String>,
}

#[derive(Serialize)]
pub struct Nutrition {
    pub calories: f32,
    pub carbs: f32,
    pub fat: f32,
    pub phosphorus: f32,
    pub potassium: f32,
    pub protein: f32,
    pub sodium: f32,
}

#[derive(Serialize)]
pub struct NutritionLimit {
    pub calories: f32,
    pub carbs: f32,
    pub fat: f32,
    pub phosphorus: f32,
    pub potassium: f32,
    pub protein: f32,
    pub sodium: f32,
}

#[derive(Serialize)]
pub struct ResponseData {
    pub user_line_id: String,
    pub days: i32,
    pub food_menus: Vec<FoodMenu>,
    pub nutrition_limit_per_day: NutritionLimit,
}