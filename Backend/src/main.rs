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
    name: Option<String>,
    calories: Option<f64>,
    protein: Option<f64>,
    carbs: Option<f64>,
    fat: Option<f64>,
    sodium: Option<f64>,
    phosphorus: Option<f64>,
    potassium: Option<f64>,
    ingredient: Option<serde_json::Value>,
    method: Option<String>,
    image_url: Option<Vec<String>>,
}

#[derive(Serialize)]
struct FoodCard {
    id: Option<i32>,
    name: Option<String>,
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
    ingredients: Option<serde_json::Value>,
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
    r.name,
    r.calories,
    COALESCE(rn_protein.quantity, 0) AS protein,
    COALESCE(rn_carbs.quantity, 0) AS carbs,
    COALESCE(rn_fat.quantity, 0) AS fat,
    COALESCE(rn_sodium.quantity, 0) AS sodium,
    COALESCE(rn_phosphorus.quantity, 0) AS phosphorus,
    COALESCE(rn_potassium.quantity, 0) AS potassium,
    r.method,
    r.recipe_img_link AS image_url,
    (
        SELECT json_agg(
            json_build_object(
                'ingredient_name', i.ingredient_name,
                'ingredient_amount', ri.amount,
                'ingredient_unit', ri.ingredient_unit
            )
        )
        FROM recipes_ingredients ri
        JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
        WHERE ri.recipe_id = r.recipe_id
    ) AS ingredient
FROM recipes r
LEFT JOIN recipe_nutrients rn_protein ON r.recipe_id = rn_protein.recipe_id AND rn_protein.nutrient_id = 1
LEFT JOIN recipe_nutrients rn_carbs ON r.recipe_id = rn_carbs.recipe_id AND rn_carbs.nutrient_id = 2
LEFT JOIN recipe_nutrients rn_fat ON r.recipe_id = rn_fat.recipe_id AND rn_fat.nutrient_id = 3
LEFT JOIN recipe_nutrients rn_sodium ON r.recipe_id = rn_sodium.recipe_id AND rn_sodium.nutrient_id = 5
LEFT JOIN recipe_nutrients rn_phosphorus ON r.recipe_id = rn_phosphorus.recipe_id AND rn_phosphorus.nutrient_id = 7
LEFT JOIN recipe_nutrients rn_potassium ON r.recipe_id = rn_potassium.recipe_id AND rn_potassium.nutrient_id = 8;
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
    r.name,
    r.calories,
    COALESCE(rn_protein.quantity, 0) AS protein,
    COALESCE(rn_carbs.quantity, 0) AS carbs,
    COALESCE(rn_fat.quantity, 0) AS fat,
    COALESCE(rn_sodium.quantity, 0) AS sodium,
    COALESCE(rn_phosphorus.quantity, 0) AS phosphorus,
    COALESCE(rn_potassium.quantity, 0) AS potassium,
    r.recipe_img_link AS image_url,
    r.food_category,
    r.dish_type,
    (
        SELECT json_agg(i.ingredient_name)
        FROM recipes_ingredients ri
        JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
        WHERE ri.recipe_id = r.recipe_id
    ) AS ingredients 
FROM recipes r
LEFT JOIN recipe_nutrients rn_protein ON r.recipe_id = rn_protein.recipe_id AND rn_protein.nutrient_id = 1
LEFT JOIN recipe_nutrients rn_carbs ON r.recipe_id = rn_carbs.recipe_id AND rn_carbs.nutrient_id = 2
LEFT JOIN recipe_nutrients rn_fat ON r.recipe_id = rn_fat.recipe_id AND rn_fat.nutrient_id = 3
LEFT JOIN recipe_nutrients rn_sodium ON r.recipe_id = rn_sodium.recipe_id AND rn_sodium.nutrient_id = 5
LEFT JOIN recipe_nutrients rn_phosphorus ON r.recipe_id = rn_phosphorus.recipe_id AND rn_phosphorus.nutrient_id = 7
LEFT JOIN recipe_nutrients rn_potassium ON r.recipe_id = rn_potassium.recipe_id AND rn_potassium.nutrient_id = 8;
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
    r.name,
    r.calories,
    COALESCE(rn_protein.quantity, 0) AS protein,
    COALESCE(rn_carbs.quantity, 0) AS carbs,
    COALESCE(rn_fat.quantity, 0) AS fat,
    COALESCE(rn_sodium.quantity, 0) AS sodium,
    COALESCE(rn_phosphorus.quantity, 0) AS phosphorus,
    COALESCE(rn_potassium.quantity, 0) AS potassium,
    r.method,
    r.recipe_img_link AS image_url,
    (
        SELECT json_agg(
            json_build_object(
                'ingredient_name', i.ingredient_name,
                'ingredient_amount', ri.amount,
                'ingredient_unit', ri.ingredient_unit
            )
        )
        FROM recipes_ingredients ri
        JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
        WHERE ri.recipe_id = r.recipe_id
    ) AS ingredient
FROM recipes r
LEFT JOIN recipe_nutrients rn_protein ON r.recipe_id = rn_protein.recipe_id AND rn_protein.nutrient_id = 1
LEFT JOIN recipe_nutrients rn_carbs ON r.recipe_id = rn_carbs.recipe_id AND rn_carbs.nutrient_id = 2
LEFT JOIN recipe_nutrients rn_fat ON r.recipe_id = rn_fat.recipe_id AND rn_fat.nutrient_id = 3
LEFT JOIN recipe_nutrients rn_sodium ON r.recipe_id = rn_sodium.recipe_id AND rn_sodium.nutrient_id = 5
LEFT JOIN recipe_nutrients rn_phosphorus ON r.recipe_id = rn_phosphorus.recipe_id AND rn_phosphorus.nutrient_id = 7
LEFT JOIN recipe_nutrients rn_potassium ON r.recipe_id = rn_potassium.recipe_id AND rn_potassium.nutrient_id = 8
WHERE r.recipe_id = $1;", recipe_id)
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
