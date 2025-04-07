use axum::{http::StatusCode, Extension, Json};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use sqlx::PgPool;
use sqlx::Row;
use std::collections::HashMap;
// use sqlx::types::chrono::NaiveDate;
use chrono::NaiveDate;
// use crate::models::user::UserData;
use crate::models::mealplan::*;

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
    .map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Error fetching user".to_string(),
        )
    })?
    .ok_or((StatusCode::NOT_FOUND, "User not found".to_string()))?;

    let filtered_recipes = sqlx::query!(
        r#"
        SELECT 
        r.recipe_id, 
        r.recipe_name,
        r.recipe_img_link, -- Include recipe_img_link in the SELECT clause
        COALESCE(SUM(CASE WHEN n.name = 'protein' THEN rn.quantity ELSE 0 END), 0) AS protein,
        COALESCE(SUM(CASE WHEN n.name = 'carbs' THEN rn.quantity ELSE 0 END), 0) AS carbs,
        COALESCE(SUM(CASE WHEN n.name = 'fat' THEN rn.quantity ELSE 0 END), 0) AS fat,
        COALESCE(SUM(CASE WHEN n.name = 'sodium' THEN rn.quantity ELSE 0 END), 0) AS sodium,
        COALESCE(SUM(CASE WHEN n.name = 'phosphorus' THEN rn.quantity ELSE 0 END), 0) AS phosphorus,
        COALESCE(SUM(CASE WHEN n.name = 'potassium' THEN rn.quantity ELSE 0 END), 0) AS potassium,
        COALESCE(r.calories, 0) AS calories
    FROM recipes r
    LEFT JOIN recipes_nutrients rn ON r.recipe_id = rn.recipe_id
    LEFT JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
    WHERE NOT EXISTS (
        SELECT 1 
        FROM recipes_ingredient_allergies ria
        JOIN users_ingredient_allergies uia ON ria.ingredient_allergy_id = uia.ingredient_allergy_id
        JOIN users u ON u.user_id = uia.user_id
        WHERE u.user_id = $1 AND ria.recipe_id = r.recipe_id
    )
    GROUP BY r.recipe_id, r.recipe_name, r.recipe_img_link, r.calories
        "#,
        user_id.user_id
    )
    .fetch_all(&pg_pool)
    .await
    .map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Error fetching filtered recipes".to_string(),
        )
    })?;

    let nutrition_limit = sqlx::query!(
        "SELECT nutrient_id, nutrient_limit FROM users_nutrients_limit_per_day WHERE user_id = $1",
        user_id.user_id
    )
    .fetch_all(&pg_pool)
    .await
    .map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Error fetching nutrition limits".to_string(),
        )
    })?;

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
            // Add recipe_img_link here
            recipe_img_link: recipe.recipe_img_link.unwrap_or_default(),
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
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to send request".to_string(),
            )
        })?
        .json::<serde_json::Value>()
        .await
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to parse response".to_string(),
            )
        })?;

    // Return the response from the external API
    Ok(Json(response))
}

pub async fn update_meal_plan(
    Extension(pg_pool): Extension<PgPool>,
    Json(payload): Json<UpdateMealPlanRequest>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    // Fetch user information
    let user = sqlx::query!(
        "SELECT user_id, user_line_id FROM users WHERE user_line_id = $1",
        payload.user_id
    )
    .fetch_optional(&pg_pool)
    .await
    .map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Error fetching user".to_string(),
        )
    })?
    .ok_or((StatusCode::NOT_FOUND, "User not found".to_string()))?;

    let user_line_id = user
        .user_line_id
        .ok_or((StatusCode::NOT_FOUND, "User LINE ID not found".to_string()))?;

    // Fetch food menus that the user is not allergic to
    let filtered_recipes = sqlx::query!(
        r#"
        SELECT r.recipe_id, r.recipe_name, r.recipe_img_link,
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
    .map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Error fetching nutrition limits".to_string(),
        )
    })?;

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
            // Add recipe_img_link here
            recipe_img_link: recipe.recipe_img_link.unwrap_or_default(),
        })
        .collect();

    // Construct the response to send to the external API
    let response_data = UpdateMealPlanResponse {
        user_line_id: user_line_id.clone(),
        days: payload.days,
        nutrition_limit_per_day: nutrition_map,
        food_menus,
        mealplan: UpdateMealPlanRequestWithoutDays {
            user_id: user_line_id.clone(),
            mealplans: payload.mealplans.clone(),
        },
    };

    // Send a POST request to the external AI service
    let client = Client::new();
    let api_url = "https://ai-rec-1025044834972.asia-southeast1.run.app/ai_update";

    let mut ai_response = client
        .post(api_url)
        .json(&response_data)
        .send()
        .await
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to send request".to_string(),
            )
        })?
        .json::<serde_json::Value>()
        .await
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to parse response".to_string(),
            )
        })?;

    // Rename `user_id` to `user_line_id` in the AI response
    if let Some(user_id) = ai_response.get("user_id").cloned() {
        ai_response.as_object_mut().unwrap().remove("user_id");
        ai_response
            .as_object_mut()
            .unwrap()
            .insert("user_line_id".to_string(), user_id);
    }

    // Return the modified AI response
    Ok(Json(ai_response))
}

// Define the request body structure (same as get_medicine)
#[derive(Deserialize)]
pub struct GetMealPlanRequest {
    pub user_line_id: String,
    pub date: Option<String>, // JS datetime string (e.g., "1990-01-01T12:00:00") - Optional for filtering
}

// Define the response structure for a single meal plan entry
#[derive(Serialize, FromRow)]
pub struct MealPlanEntry {
    pub meal_plan_id: i32,
    pub user_id: i32,
    pub name: String,
    pub date: NaiveDate,
    pub recipes: Vec<RecipeInfo>,
}

#[derive(Serialize, FromRow, Clone)]
pub struct RecipeInfo {
    pub recipe_id: i32,
    pub recipe_name: String,
    pub recipe_img_link: Vec<String>,
    pub ischecked: bool,
}

// Define the overall response structure
#[derive(Serialize)]
pub struct GetMealPlanResponse {
    pub meal_plans: Vec<MealPlanEntry>,
}

#[derive(Serialize)]
pub struct ErrorResponse {
    pub error: String,
}

#[axum::debug_handler]
pub async fn get_meal_plan(
    Extension(db_pool): Extension<PgPool>,
    Json(payload): Json<GetMealPlanRequest>,
) -> Result<Json<GetMealPlanResponse>, (StatusCode, Json<ErrorResponse>)> {
    // 1. Find user_id from user_line_id
    let user_id_result = sqlx::query!(
        "SELECT user_id FROM users WHERE user_line_id = $1",
        payload.user_line_id
    )
    .fetch_optional(&db_pool)
    .await
    .map_err(|e| {
        eprintln!("Database error fetching user_id: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: "Error fetching user".to_string(),
            }),
        )
    })?;

    let user_id = match user_id_result {
        Some(user) => user.user_id,
        None => {
            return Err((
                StatusCode::NOT_FOUND,
                Json(ErrorResponse {
                    error: "User not found".to_string(),
                }),
            ));
        }
    };

    // 2. Build the query based on whether a date is provided
    let mut query = r#"
        SELECT
            mp.meal_plan_id,
            mp.user_id,
            mp.name,
            mp.date,
            mpr.recipe_id,
            r.recipe_name,
            r.recipe_img_link,
            mpr.ischecked -- Added ischecked
        FROM
            meal_plans mp
        INNER JOIN
            meal_plan_recipes mpr ON mp.meal_plan_id = mpr.meal_plan_id
        INNER JOIN
            recipes r ON mpr.recipe_id = r.recipe_id
        WHERE
            mp.user_id = $1
    "#
    .to_string();
    let mut query_builder = sqlx::query(&query);

    if let Some(date_str) = payload.date {
        // Parse the date string into a NaiveDate
        let date = NaiveDate::parse_from_str(&date_str, "%Y-%m-%dT%H:%M:%S").map_err(|e| {
            eprintln!("Error parsing date: {}", e);
            (
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse {
                    error: "Invalid date format. Use YYYY-MM-DDTHH:MM:SS".to_string(),
                }),
            )
        })?;
        // Add a condition to filter by date
        query.push_str(" AND mp.date = $2");
        query_builder = sqlx::query(&query).bind(user_id).bind(date);
    } else {
        query_builder = sqlx::query(&query).bind(user_id);
    }

    // 3. Fetch meal plans
    let rows = query_builder.fetch_all(&db_pool).await.map_err(|e| {
        eprintln!("Database error fetching meal plans: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: "Error fetching meal plans".to_string(),
            }),
        )
    })?;

    // 4. Organize the data into the desired structure
    let mut meal_plans_map: HashMap<i32, MealPlanEntry> = HashMap::new();
    for row in rows {
        let meal_plan_id: i32 = row.get("meal_plan_id");
        let recipe_id: i32 = row.get("recipe_id");
        let recipe_name: String = row.get("recipe_name");
        let recipe_img_link: Vec<String> = row.get("recipe_img_link");
        let ischecked: bool = row.get("ischecked"); // Get ischecked

        let meal_plan_entry = meal_plans_map
            .entry(meal_plan_id)
            .or_insert_with(|| MealPlanEntry {
                meal_plan_id: row.get("meal_plan_id"),
                user_id: row.get("user_id"),
                name: row.get("name"),
                date: row.get("date"),
                recipes: Vec::new(),
            });

        meal_plan_entry.recipes.push(RecipeInfo {
            recipe_id,
            recipe_name,
            recipe_img_link,
            ischecked, // Add ischecked
        });
    }

    let meal_plans: Vec<MealPlanEntry> = meal_plans_map.into_values().collect();

    Ok(Json(GetMealPlanResponse { meal_plans }))
}
