use crate::models::mealplan::MealPlanRequest;
use axum::{http::StatusCode, Extension, Json};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

#[derive(Deserialize)]
pub struct UserData {
    pub u_id: String,
    pub days: i32,
}

#[derive(Serialize)]
pub struct FoodMenu {
    pub name: String,
    pub nutrition: Nutrition,
    pub recipe_id: String,
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
    pub user_id: String,
    pub days: i32,
    pub nutrition_limit_per_day: NutritionLimit,
    pub food_menus: Vec<FoodMenu>,
    pub mealplan: UpdateMealPlanRequestWithoutDays,
}

#[axum::debug_handler]
pub async fn create_meal_plan(
    Extension(pg_pool): Extension<PgPool>,
    Json(payload): Json<MealPlanRequest>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    let user_id = sqlx::query!(
        "SELECT user_id, user_line_id FROM users WHERE user_line_id = $1",
        payload.data.u_id
    )
    .fetch_optional(&pg_pool)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Error fetching user".to_string()))?
    .ok_or((StatusCode::NOT_FOUND, "User not found".to_string()))?;

    let filtered_recipes = sqlx::query!(
        r#"
        SELECT r.recipe_id, r.recipe_name, 
            COALESCE(SUM(rn.quantity), 0) as protein,
            COALESCE(SUM(rn.quantity), 0) as carbs,
            COALESCE(SUM(rn.quantity), 0) as fat,
            COALESCE(SUM(rn.quantity), 0) as sodium,
            COALESCE(SUM(rn.quantity), 0) as phosphorus,
            COALESCE(SUM(rn.quantity), 0) as potassium,
            COALESCE(SUM(rn.quantity), 0) as calories
        FROM recipes r
        LEFT JOIN recipes_nutrients rn ON r.recipe_id = rn.recipe_id
        WHERE NOT EXISTS (
            SELECT 1 
            FROM recipes_ingredient_allergies ria
            JOIN users_ingredient_allergies uia ON ria.ingredient_allergy_id = uia.ingredient_allergy_id
            JOIN users u ON u.user_id = uia.user_id
            WHERE u.user_id = $1 AND ria.recipe_id = r.recipe_id
        )
        GROUP BY r.recipe_id
        "#,
        user_id.user_id
    )
    .fetch_all(&pg_pool)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Error fetching filtered recipes".to_string()))?;

    let nutrition_limit = sqlx::query!(
        "SELECT nutrient_id, nutrient_limit FROM users_nutrients_limit_per_day WHERE user_id = $1",
        user_id.user_id
    )
    .fetch_all(&pg_pool)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Error fetching nutrition limits".to_string()))?;

    let mut nutrition_map = NutritionLimit {
        calories: 0.0,
        carbs: 0.0,
        fat: 0.0,
        phosphorus: 0.0,
        potassium: 0.0,
        protein: 0.0,
        sodium: 0.0,
    };

    for limit in nutrition_limit {
        match limit.nutrient_id {
            Some(1) => nutrition_map.calories = limit.nutrient_limit.unwrap_or(0.0) as f32,
            Some(2) => nutrition_map.carbs = limit.nutrient_limit.unwrap_or(0.0) as f32,
            Some(3) => nutrition_map.fat = limit.nutrient_limit.unwrap_or(0.0) as f32,
            Some(4) => nutrition_map.phosphorus = limit.nutrient_limit.unwrap_or(0.0) as f32,
            Some(5) => nutrition_map.potassium = limit.nutrient_limit.unwrap_or(0.0) as f32,
            Some(6) => nutrition_map.protein = limit.nutrient_limit.unwrap_or(0.0) as f32,
            Some(7) => nutrition_map.sodium = limit.nutrient_limit.unwrap_or(0.0) as f32,
            _ => (),
        }
    }

    let food_menus: Vec<FoodMenu> = filtered_recipes
        .into_iter()
        .map(|recipe| FoodMenu {
            name: recipe.recipe_name,
            nutrition: Nutrition {
                calories: recipe.calories.unwrap_or(0.0) as f32,
                carbs: recipe.carbs.unwrap_or(0.0) as f32,
                fat: recipe.fat.unwrap_or(0.0) as f32,
                phosphorus: recipe.phosphorus.unwrap_or(0.0) as f32,
                potassium: recipe.potassium.unwrap_or(0.0) as f32,
                protein: recipe.protein.unwrap_or(0.0) as f32,
                sodium: recipe.sodium.unwrap_or(0.0) as f32,
            },
            recipe_id: recipe.recipe_id.to_string(),
        })
        .collect();

    let response_data = ResponseData {
        user_line_id: user_id.user_line_id.unwrap_or_default(),
        days: payload.data.days as i32,
        food_menus,
        nutrition_limit_per_day: nutrition_map,
    };

    // Convert response_data to JSON and send a POST request
    let client = Client::new();
    let api_url = "https://ai-rec-1025044834972.asia-southeast1.run.app/ai";

    let response = client
        .post(api_url)
        .json(&response_data)
        .send()
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to send request".to_string()))?
        .json::<serde_json::Value>()
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to parse response".to_string()))?;

    // Return the response from the external API
    Ok(Json(response))
}

pub async fn update_meal_plan(
    Extension(pg_pool): Extension<PgPool>,
    Json(payload): Json<UpdateMealPlanRequest>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    // Fetch user information
    let user = sqlx::query!(
        "SELECT user_id FROM users WHERE user_line_id = $1",
        payload.user_id
    )
    .fetch_optional(&pg_pool)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Error fetching user".to_string()))?
    .ok_or((StatusCode::NOT_FOUND, "User not found".to_string()))?;

    // Fetch food menus that the user is not allergic to
    let filtered_recipes = sqlx::query!(
        r#"
        SELECT r.recipe_id, r.recipe_name, 
            COALESCE(SUM(rn.quantity), 0) as protein,
            COALESCE(SUM(rn.quantity), 0) as carbs,
            COALESCE(SUM(rn.quantity), 0) as fat,
            COALESCE(SUM(rn.quantity), 0) as sodium,
            COALESCE(SUM(rn.quantity), 0) as phosphorus,
            COALESCE(SUM(rn.quantity), 0) as potassium,
            COALESCE(SUM(rn.quantity), 0) as calories
        FROM recipes r
        LEFT JOIN recipes_nutrients rn ON r.recipe_id = rn.recipe_id
        WHERE NOT EXISTS (
            SELECT 1 
            FROM recipes_ingredient_allergies ria
            JOIN users_ingredient_allergies uia ON ria.ingredient_allergy_id = uia.ingredient_allergy_id
            JOIN users u ON u.user_id = uia.user_id
            WHERE u.user_id = $1 AND ria.recipe_id = r.recipe_id
        )
        GROUP BY r.recipe_id
        "#,
        user.user_id
    )
    .fetch_all(&pg_pool)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Error fetching filtered recipes".to_string()))?;

    // Fetch the user's daily nutrition limits
    let nutrition_limit = sqlx::query!(
        "SELECT nutrient_id, nutrient_limit FROM users_nutrients_limit_per_day WHERE user_id = $1",
        user.user_id
    )
    .fetch_all(&pg_pool)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Error fetching nutrition limits".to_string()))?;

    // Process the nutrition limits
    let mut nutrition_map = NutritionLimit {
        calories: 0.0,
        carbs: 0.0,
        fat: 0.0,
        phosphorus: 0.0,
        potassium: 0.0,
        protein: 0.0,
        sodium: 0.0,
    };

    for limit in nutrition_limit {
        match limit.nutrient_id {
            Some(1) => nutrition_map.calories = limit.nutrient_limit.unwrap_or(0.0) as f32,
            Some(2) => nutrition_map.carbs = limit.nutrient_limit.unwrap_or(0.0) as f32,
            Some(3) => nutrition_map.fat = limit.nutrient_limit.unwrap_or(0.0) as f32,
            Some(4) => nutrition_map.phosphorus = limit.nutrient_limit.unwrap_or(0.0) as f32,
            Some(5) => nutrition_map.potassium = limit.nutrient_limit.unwrap_or(0.0) as f32,
            Some(6) => nutrition_map.protein = limit.nutrient_limit.unwrap_or(0.0) as f32,
            Some(7) => nutrition_map.sodium = limit.nutrient_limit.unwrap_or(0.0) as f32,
            _ => (),
        }
    }

    // Convert the filtered recipes into the required `FoodMenu` format
    let food_menus: Vec<FoodMenu> = filtered_recipes
        .into_iter()
        .map(|recipe| FoodMenu {
            name: recipe.recipe_name,
            nutrition: Nutrition {
                calories: recipe.calories.unwrap_or(0.0) as f32,
                carbs: recipe.carbs.unwrap_or(0.0) as f32,
                fat: recipe.fat.unwrap_or(0.0) as f32,
                phosphorus: recipe.phosphorus.unwrap_or(0.0) as f32,
                potassium: recipe.potassium.unwrap_or(0.0) as f32,
                protein: recipe.protein.unwrap_or(0.0) as f32,
                sodium: recipe.sodium.unwrap_or(0.0) as f32,
            },
            recipe_id: recipe.recipe_id.to_string(),
        })
        .collect();

    // Construct the response to send to the external API
    let response_data = UpdateMealPlanResponse {
        user_id: payload.user_id.clone(),
        days: payload.days,
        nutrition_limit_per_day: nutrition_map,
        food_menus,
        mealplan: UpdateMealPlanRequestWithoutDays {
            user_id: payload.user_id.clone(),
            mealplans: payload.mealplans.clone(),
        },
    };

    // Send a POST request to the external AI service
    let client = Client::new();
    let api_url = "https://ai-rec-1025044834972.asia-southeast1.run.app/ai_update";

    let ai_response = client
        .post(api_url)
        .json(&response_data)
        .send()
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to send request".to_string()))?
        .json::<serde_json::Value>()
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to parse response".to_string()))?;

    // Return the AI response
    Ok(Json(ai_response))
}
