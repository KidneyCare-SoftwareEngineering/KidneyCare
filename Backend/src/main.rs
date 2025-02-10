use std::{fs::File, io::BufReader};

use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sqlx::{postgres::PgPoolOptions, PgPool};
use tokio::net::TcpListener;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().expect("Failed to load .env file");

    let server_address = std::env::var("SERVER_ADDRESS").unwrap_or("127.0.0.1:3000".to_owned());
    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL is not set");

    let db_pool = PgPoolOptions::new()
        .max_connections(16)
        .connect(&database_url)
        .await
        .expect("Failed to connect to database");

    let listener = TcpListener::bind(server_address)
        .await
        .expect("Failed to bind to address");
    println!("Listening on {}", listener.local_addr().unwrap());

    let app = Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .route("/food_details", get(get_food_details))
        .route("/food_cards", get(get_food_cards))
        .route("/get_limit", get(get_limit))
        .route("/food_details/:recipe_id", get(get_food_detail_by_id))
        .route("/meal_plan", post(get_meal_plan))
        .with_state(db_pool);

    axum::serve(listener, app)
        .await
        .expect("Failed to start server");
}

#[derive(Serialize)]
struct FoodDetail {
    id: Option<i32>,
    recipe_name: Option<String>,
    calories: Option<f64>,
    protein: Option<f64>,
    carbs: Option<f64>,
    fat: Option<f64>,
    sodium: Option<f64>,
    phosphorus: Option<f64>,
    potassium: Option<f64>,
    ingredient: Option<serde_json::Value>,
    recipe_method: Option<Vec<String>>,
    image_url: Option<Vec<String>>,
}

#[derive(Serialize)]
struct FoodCard {
    id: Option<i32>,
    recipe_name: Option<String>,
    calories: Option<f64>,
    protein: Option<f64>,
    carbs: Option<f64>,
    fat: Option<f64>,
    sodium: Option<f64>,
    phosphorus: Option<f64>,
    potassium: Option<f64>,
    image_url: Option<Vec<String>>,
    food_category: Option<Vec<String>>,
    dish_type: Option<Vec<String>>,
    ingredients: Option<Vec<String>>,
}

#[derive(Deserialize)]
struct MealPlanRequest {
    data: UserMealRequest,
}

#[derive(Deserialize)]
struct UserMealRequest {
    u_id: String,
    days: u32,
}

async fn get_meal_plan(
    Json(payload): Json<MealPlanRequest>,
) -> Result<Json<Value>, (StatusCode, String)> {
    let file = File::open("src/mockup_data/meal_plan.json").map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to open meal plan file".to_string(),
        )
    })?;

    let reader = BufReader::new(file);

    let data: Value = serde_json::from_reader(reader).map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to read meal plan file".to_string(),
        )
    })?;

    Ok(Json(data))
}
async fn get_food_details(
    State(pg_pool): State<PgPool>,
) -> Result<Json<Vec<FoodDetail>>, (StatusCode, String)> {
    let rows = sqlx::query_as!(FoodDetail, "SELECT 
    r.recipe_id AS id,
    r.recipe_name,
    r.calories,
    r.recipe_img_link AS image_url,
    COALESCE(
        json_agg(
            json_build_object(
                'ingredient_amount', ri.amount,
                'ingredient_name', i.ingredient_name,
                'ingredient_unit', ri.ingredient_unit
            )
        ) FILTER (WHERE i.ingredient_id IS NOT NULL), '[]'::json
    ) AS ingredient,
    r.recipe_method, -- Assuming recipe_method is stored as TEXT[]
    COALESCE((
        SELECT SUM(rn.quantity) 
        FROM recipes_nutrients rn
        JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
        WHERE rn.recipe_id = r.recipe_id AND n.name = 'protein'
    ), 0) AS protein,
    COALESCE((
        SELECT SUM(rn.quantity) 
        FROM recipes_nutrients rn
        JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
        WHERE rn.recipe_id = r.recipe_id AND n.name = 'carbs'
    ), 0) AS carbs,
    COALESCE((
        SELECT SUM(rn.quantity) 
        FROM recipes_nutrients rn
        JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
        WHERE rn.recipe_id = r.recipe_id AND n.name = 'fat'
    ), 0) AS fat,
    COALESCE((
        SELECT SUM(rn.quantity) 
        FROM recipes_nutrients rn
        JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
        WHERE rn.recipe_id = r.recipe_id AND n.name = 'sodium'
    ), 0) AS sodium,
    COALESCE((
        SELECT SUM(rn.quantity) 
        FROM recipes_nutrients rn
        JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
        WHERE rn.recipe_id = r.recipe_id AND n.name = 'phosphorus'
    ), 0) AS phosphorus,
    COALESCE((
        SELECT SUM(rn.quantity) 
        FROM recipes_nutrients rn
        JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
        WHERE rn.recipe_id = r.recipe_id AND n.name = 'potassium'
    ), 0) AS potassium
FROM 
    recipes r
LEFT JOIN 
    recipes_ingredients ri ON r.recipe_id = ri.recipe_id
LEFT JOIN 
    ingredients i ON ri.ingredient_id = i.ingredient_id
GROUP BY
    r.recipe_id;
").fetch_all(&pg_pool)
    .await
    .map_err(|_e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to fetch food details".to_string(),
        )
    })?;

    Ok(Json(rows))
}

async fn get_food_cards(
    State(pg_pool): State<PgPool>,
) -> Result<Json<Vec<FoodCard>>, (StatusCode, String)> {
    let rows = sqlx::query_as!(FoodCard, "SELECT 
    r.recipe_id AS id,
    r.recipe_name,
    r.calories,
    r.recipe_img_link AS image_url,
    r.food_category,
    r.dish_type,
    COALESCE(array_agg(i.ingredient_name), ARRAY[]::VARCHAR[]) AS ingredients,
    COALESCE((
        SELECT SUM(rn.quantity) 
        FROM recipes_nutrients rn
        JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
        WHERE rn.recipe_id = r.recipe_id AND n.name = 'protein'
    ), 0) AS protein,
    COALESCE((
        SELECT SUM(rn.quantity) 
        FROM recipes_nutrients rn
        JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
        WHERE rn.recipe_id = r.recipe_id AND n.name = 'carbs'
    ), 0) AS carbs,
    COALESCE((
        SELECT SUM(rn.quantity) 
        FROM recipes_nutrients rn
        JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
        WHERE rn.recipe_id = r.recipe_id AND n.name = 'fat'
    ), 0) AS fat,
    COALESCE((
        SELECT SUM(rn.quantity) 
        FROM recipes_nutrients rn
        JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
        WHERE rn.recipe_id = r.recipe_id AND n.name = 'sodium'
    ), 0) AS sodium,
    COALESCE((
        SELECT SUM(rn.quantity) 
        FROM recipes_nutrients rn
        JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
        WHERE rn.recipe_id = r.recipe_id AND n.name = 'phosphorus'
    ), 0) AS phosphorus,
    COALESCE((
        SELECT SUM(rn.quantity) 
        FROM recipes_nutrients rn
        JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
        WHERE rn.recipe_id = r.recipe_id AND n.name = 'potassium'
    ), 0) AS potassium
FROM 
    recipes r
LEFT JOIN 
    recipes_ingredients ri ON r.recipe_id = ri.recipe_id
LEFT JOIN 
    ingredients i ON ri.ingredient_id = i.ingredient_id
GROUP BY
    r.recipe_id;
").fetch_all(&pg_pool)
    .await
    .map_err(|_e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to fetch food cards".to_string(),
        )
    })?;

    Ok(Json(rows))
}

async fn get_limit() -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    let file = File::open("src/mockup_data/data_to_ai.json").map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to open data file".to_string(),
        )
    })?;
    let reader = BufReader::new(file);
    let data: serde_json::Value = serde_json::from_reader(reader).map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to read data file".to_string(),
        )
    })?;

    Ok(Json(data))
}

async fn get_food_detail_by_id(
    State(pg_pool): State<PgPool>,
    Path(recipe_id): Path<i32>,
) -> Result<Json<FoodDetail>, (StatusCode, String)> {
    let row = sqlx::query_as!(FoodDetail, "SELECT 
    r.recipe_id AS id,
    r.recipe_name,
    r.calories,
    r.recipe_img_link AS image_url,
    COALESCE(
        json_agg(
            json_build_object(
                'ingredient_amount', ri.amount,
                'ingredient_name', i.ingredient_name,
                'ingredient_unit', ri.ingredient_unit
            )
        ) FILTER (WHERE i.ingredient_id IS NOT NULL), '[]'::json
    ) AS ingredient,
    r.recipe_method, -- Assuming recipe_method is stored as TEXT[]
    COALESCE((SELECT SUM(rn.quantity) 
        FROM recipes_nutrients rn
        JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
        WHERE rn.recipe_id = r.recipe_id AND n.name = 'protein'
    ), 0) AS protein,
    COALESCE((SELECT SUM(rn.quantity) 
        FROM recipes_nutrients rn
        JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
        WHERE rn.recipe_id = r.recipe_id AND n.name = 'carbs'
    ), 0) AS carbs,
    COALESCE((SELECT SUM(rn.quantity) 
        FROM recipes_nutrients rn
        JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
        WHERE rn.recipe_id = r.recipe_id AND n.name = 'fat'
    ), 0) AS fat,
    COALESCE((SELECT SUM(rn.quantity) 
        FROM recipes_nutrients rn
        JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
        WHERE rn.recipe_id = r.recipe_id AND n.name = 'sodium'
    ), 0) AS sodium,
    COALESCE((SELECT SUM(rn.quantity) 
        FROM recipes_nutrients rn
        JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
        WHERE rn.recipe_id = r.recipe_id AND n.name = 'phosphorus'
    ), 0) AS phosphorus,
    COALESCE((SELECT SUM(rn.quantity) 
        FROM recipes_nutrients rn
        JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
        WHERE rn.recipe_id = r.recipe_id AND n.name = 'potassium'
    ), 0) AS potassium
FROM 
    recipes r
LEFT JOIN 
    recipes_ingredients ri ON r.recipe_id = ri.recipe_id
LEFT JOIN 
    ingredients i ON ri.ingredient_id = i.ingredient_id
WHERE 
    r.recipe_id = $1
GROUP BY
    r.recipe_id;", recipe_id)
    .fetch_optional(&pg_pool)
    .await
    .map_err(|_e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to fetch food detail".to_string(),
        )
    })?;

    match row {
        Some(recipe) => Ok(Json(recipe)),
        None => Err((StatusCode::NOT_FOUND, "Recipe not found".to_string())),
    }
}
