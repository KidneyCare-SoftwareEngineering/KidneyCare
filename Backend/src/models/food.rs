use serde::Serialize;

#[derive(Serialize)]
pub struct FoodDetail {
    pub id: Option<i32>,
    pub recipe_name: Option<String>,
    pub calories: Option<f64>,
    pub protein: Option<f64>,
    pub carbs: Option<f64>,
    pub fat: Option<f64>,
    pub sodium: Option<f64>,
    pub phosphorus: Option<f64>,
    pub potassium: Option<f64>,
    pub ingredient: Option<serde_json::Value>,
    pub recipe_method: Option<Vec<String>>,
    pub image_url: Option<Vec<String>>,
}

#[derive(Serialize)]
pub struct FoodCard {
    pub id: Option<i32>,
    pub recipe_name: Option<String>,
    pub calories: Option<f64>,
    pub protein: Option<f64>,
    pub carbs: Option<f64>,
    pub fat: Option<f64>,
    pub sodium: Option<f64>,
    pub phosphorus: Option<f64>,
    pub potassium: Option<f64>,
    pub image_url: Option<Vec<String>>,
    pub food_category: Option<Vec<String>>,
    pub dish_type: Option<Vec<String>>,
    pub ingredients: Option<Vec<String>>,
    pub ingredients_eng: Option<Vec<String>>,
}