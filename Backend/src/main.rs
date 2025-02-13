use std::{fs::File, io::BufReader};

use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Deserializer, Serialize};
// use chrono::NaiveDateTime;
use serde_json::{json, Value};
use sqlx::{postgres::PgPoolOptions, PgPool, Transaction};
use tokio::net::TcpListener;
use chrono::{DateTime, NaiveDate, NaiveDateTime, Utc, Datelike};
use time::{format_description::well_known::{iso8601, Iso8601}, Date, PrimitiveDateTime, Time};
use time::macros::datetime;
use serde::de::Error;

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
        .route("/users", post(create_user))
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
    ingredients_eng: Option<Vec<String>>,
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

#[derive(Deserialize)]
struct CreateUser {
    user_line_id: Option<String>,
    name: String,
    #[serde(deserialize_with = "deserialize_datetime")]
    birthdate: PrimitiveDateTime, 
    weight: f64,
    height: f64,
    profile_img_link: Option<String>,
    gender: Option<String>,
    kidney_level: Option<i32>,
    kidney_dialysis: Option<bool>,
    users_food_condition: Option<Vec<i32>>,
    user_disease: Option<Vec<i32>>,
    users_ingredient_allergies: Option<Vec<i32>>
}

fn deserialize_datetime<'de, D>(deserializer: D) -> Result<PrimitiveDateTime, D::Error>
where
    D: Deserializer<'de>,
{
    let date_str: String = Deserialize::deserialize(deserializer)?;
    PrimitiveDateTime::parse(&date_str, &Iso8601::DEFAULT)
        .map_err(D::Error::custom)
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
    COALESCE(array_agg(i.ingredient_name) FILTER (WHERE i.ingredient_name IS NOT NULL), ARRAY[]::VARCHAR[]) AS ingredients,
    COALESCE(array_agg(i.ingredient_name_eng) FILTER (WHERE i.ingredient_name_eng IS NOT NULL), ARRAY[]::VARCHAR[]) AS ingredients_eng,
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
    .map_err(|e| {
        eprintln!("Failed to fetch food cards: {}", e);
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

pub async fn create_user(
    State(pg_pool): State<PgPool>,
    Json(payload): Json<CreateUser>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, String)> {
    let mut tx = pg_pool.begin().await.map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to start transaction".to_string()))?;

    // Convert birthdate to age
    let birthdate_str = payload.birthdate.date().to_string();
    let birthdate = NaiveDate::parse_from_str(&birthdate_str, "%Y-%m-%d")
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid birthdate format".to_string()))?;
    let age = Utc::now().naive_utc().year() - birthdate.year();

    // Handle Option types for kidney_level and kidney_dialysis
    let kidney_level = payload.kidney_level.ok_or((StatusCode::BAD_REQUEST, "kidney_level is required".to_string()))?;
    let kidney_dialysis = payload.kidney_dialysis.ok_or((StatusCode::BAD_REQUEST, "kidney_dialysis is required".to_string()))?;

    // Insert user
    let user_result = sqlx::query!(
        "INSERT INTO users (user_line_id, name, birthdate, weight, height, profile_img_link, gender, kidney_level, kidney_dialysis)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING user_id",
        payload.user_line_id,
        payload.name,
        payload.birthdate,
        payload.weight,
        payload.height,
        payload.profile_img_link,
        payload.gender,
        payload.kidney_level,
        payload.kidney_dialysis
    )
    .fetch_one(&mut *tx)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to insert user".to_string()))?;

    let user_id = user_result.user_id;

    // Calculate and insert nutrient limits
    insert_nutrient_limits(user_id, payload.weight as f32, age, payload.kidney_level.unwrap(), payload.kidney_dialysis.unwrap(), &mut tx).await?;

    // Insert related user data (food conditions, diseases, allergies)
    insert_user_relations(user_id, &payload, &mut tx).await?;

    tx.commit().await.map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to commit transaction".to_string()))?;
    
    // Return with status code and the JSON response
    Ok((StatusCode::CREATED, Json(json!({ "user_id": user_id }))))
}


// Insert users_nutrients_limit_per_day
async fn insert_nutrient_limits(
    user_id: i32,
    weight: f32,
    age: i32,
    kidney_level: i32,
    kidney_dialysis: bool,
    tx: &mut Transaction<'_, sqlx::Postgres>,
) -> Result<(), (StatusCode, String)> {
    let (protein_factor, energy_factor) = match kidney_level {
        1 => (0.9, 35.0),
        2 => (0.75, 35.0),
        3 => (0.48, 35.0),
        4 => (0.23, 35.0),
        5 => (0.10, 35.0),
        _ => return Err((StatusCode::BAD_REQUEST, "Invalid kidney level".to_string())),
    };

    let protein = if kidney_dialysis {
        weight * 1.2
    } else if kidney_level >= 3 {
        weight * 0.6
    } else {
        weight * protein_factor
    };

    let energy = if age >= 60 { weight * 30.0 } else { weight * 35.0 };

    let nutrient_limits = vec![
        (1, protein),   // Protein (g)
        (2, energy),    // Carbs (assumed as energy kcal)
        (3, -1.0),       // Fat (no specific formula)
        (4, 2000.0),    // Sodium (mg)
        (5, 900.0),    // Phosphorus (mg)
        (6, 2500.0),    // Potassium (mg)
    ];

    for (nutrient_id, limit) in nutrient_limits {
        sqlx::query!(
            "INSERT INTO users_nutrients_limit_per_day (user_id, nutrient_id, nutrient_limit) VALUES ($1, $2, $3)",
            user_id,
            nutrient_id,
            limit as f64
        )
        .execute(&mut **tx)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to insert nutrient limits".to_string()))?;
    }

    Ok(())
}

// Insert related tables (food conditions, diseases, allergies)
// Insert related tables (food conditions, diseases, allergies)
async fn insert_user_relations(
    user_id: i32,
    payload: &CreateUser,
    tx: &mut Transaction<'_, sqlx::Postgres>,
) -> Result<(), (StatusCode, String)> {
    if let Some(food_conditions) = &payload.users_food_condition {
        for &food_condition_id in food_conditions {
            sqlx::query!(
                "INSERT INTO users_food_condition_types (user_id, food_condition_type_id) VALUES ($1, $2)",
                user_id, food_condition_id
            )
            .execute(&mut **tx)
            .await
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to insert food condition".to_string()))?;
        }
    }

    if let Some(diseases) = &payload.user_disease {
        for &disease_id in diseases {
            sqlx::query!(
                "INSERT INTO users_diseases (user_id, disease_id) VALUES ($1, $2)",
                user_id, disease_id
            )
            .execute(&mut **tx)
            .await
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to insert disease".to_string()))?;
        }
    }

    if let Some(ingredient_allergies) = &payload.users_ingredient_allergies {
        for &allergy_id in ingredient_allergies {
            sqlx::query!(
                "INSERT INTO users_ingredient_allergies (user_id, ingredient_allergy_id) VALUES ($1, $2)",
                user_id, allergy_id
            )
            .execute(&mut **tx)
            .await
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to insert ingredient allergies".to_string()))?;
        }
    }

    Ok(())
}

