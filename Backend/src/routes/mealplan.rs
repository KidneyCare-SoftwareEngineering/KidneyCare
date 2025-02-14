use axum::{http::StatusCode, Json, Extension};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use crate::models::mealplan::MealPlanRequest;

#[derive(Deserialize)]
pub struct UserData {
    pub u_id: String,
    pub days: i32,
}

// #[derive(Serialize)]
// pub struct Response {
//     pub data: ResponseData,
// }

// #[derive(Serialize)]
// pub struct ResponseData {
//     pub days: i32,
//     pub food_menus: Vec<FoodMenu>,
//     pub nutrition_limit_per_day: NutritionLimit,
// }

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
pub struct Response {
    pub data: ResponseData,
}

#[derive(Serialize)]
pub struct ResponseData {
    pub user_line_id: String,  // Add this field
    pub days: i32,
    pub food_menus: Vec<FoodMenu>,
    pub nutrition_limit_per_day: NutritionLimit,
}

#[axum::debug_handler]
pub async fn create_meal_plan(
    Extension(pg_pool): Extension<PgPool>,
    Json(payload): Json<MealPlanRequest>,
) -> Result<Json<ResponseData>, (StatusCode, String)> { // Change the return type to ResponseData
    // Step 1: Get user_id from user_line_id (u_id)
    let user_id = sqlx::query!(
        "SELECT user_id, user_line_id FROM users WHERE user_line_id = $1",
        payload.data.u_id
    )
    .fetch_optional(&pg_pool)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Error fetching user".to_string()))?
    .ok_or((StatusCode::NOT_FOUND, "User not found".to_string()))?;

    // Step 2: Filter out recipes based on allergies
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

    // Step 3: Get nutrition limit per day
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

    // Step 4: Format and return response
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

    Ok(Json(ResponseData {
        user_line_id: user_id.user_line_id.unwrap_or_default(), // Add user_line_id to the response
        days: payload.data.days as i32,
        food_menus,
        nutrition_limit_per_day: nutrition_map,
    }))
}
