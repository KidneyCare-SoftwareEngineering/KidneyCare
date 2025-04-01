use crate::schema::{meal_plan_recipes, meal_plans, recipes, users};
use axum::http::StatusCode;
use axum::{Extension, Json};
use chrono::NaiveDate;
use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, Pool};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::collections::HashMap;
use std::sync::Arc;

#[derive(Deserialize, Debug)]
pub struct Recipe {
    pub recipe_id: Option<String>, // recipe_id is optional as it might be missing
}

#[derive(Deserialize, Debug)]
pub struct CreateMealPlanPayload {
    pub user_line_id: String,        // The user_line_id field
    pub mealplans: Vec<Vec<Recipe>>, // A 2D vector representing the meal plans
}

#[derive(Deserialize, Debug)]
pub struct GetMealPlanRequest {
    pub user_line_id: String,
    pub date: Option<String>,
}

#[derive(Serialize, Debug)]
pub struct RecipeInfo {
    pub recipe_id: i32,
    pub recipe_name: String,
    pub recipe_img_link: Vec<String>,
    pub ischecked: Option<bool>,
    pub meal_plan_recipe_id: i32, // Add meal_plan_recipe_id
}

#[derive(Serialize, Debug)]
pub struct MealPlanEntry {
    pub meal_plan_id: i32,
    pub user_id: i32,
    pub name: String,
    pub date: NaiveDate,
    pub recipes: Vec<RecipeInfo>,
}

#[derive(Serialize, Debug)]
pub struct GetMealPlanResponse {
    pub meal_plans: Vec<MealPlanEntry>,
}

#[derive(Serialize, Debug)]
pub struct ErrorResponse {
    pub error: String,
}

pub type DbPool = Pool<ConnectionManager<PgConnection>>;

#[axum::debug_handler]
pub async fn create_meal_plan(
    Extension(db_pool): Extension<Arc<DbPool>>,
    Json(payload): Json<CreateMealPlanPayload>,
) -> Result<Json<serde_json::Value>, Json<serde_json::Value>> {
    println!("Received create_meal_plan payload: {:?}", payload);

    let mut conn = db_pool.get().map_err(|err| {
        println!("Failed to connect to the database: {}", err);
        Json(json!({ "status": "error", "message": "Failed to connect to the database" }))
    })?;

    // 1. Fetch user_id from user_line_id
    let user_id: i32 = users::table
        .filter(users::user_line_id.eq(&payload.user_line_id))
        .select(users::user_id)
        .first(&mut conn)
        .map_err(|err| {
            println!("Failed to fetch user: {}", err);
            Json(json!({ "status": "error", "message": "User not found" }))
        })?;

    println!("Fetched user_id: {}", user_id);

    // 2. Find the latest meal plan date for the user
    let latest_date: Option<NaiveDate> = meal_plans::table
        .filter(meal_plans::user_id.eq(user_id))
        .select(meal_plans::date)
        .order(meal_plans::date.desc())
        .first::<NaiveDate>(&mut conn)
        .optional()
        .map_err(|err| {
            println!("Failed to fetch latest meal plan date: {}", err);
            Json(json!({ "status": "error", "message": "Failed to fetch latest meal plan date" }))
        })?;

    let today = chrono::Local::now().date_naive();
    let start_date = match latest_date {
        Some(date) if date >= today => date + chrono::Duration::days(1), // Start from the next day if the latest date is in the future or today
        _ => today, // Start from today if no meal plans exist or the latest date is in the past
    };

    println!("Starting meal plan creation from date: {}", start_date);

    // 3. Create new meal plans
    let transaction_result = {
        let conn = &mut conn;
        conn.transaction::<_, diesel::result::Error, _>(|conn| {
            for (day_index, day_mealplans) in payload.mealplans.iter().enumerate() {
                let meal_plan_date = start_date + chrono::Duration::days(day_index as i64);
                println!("Creating meal plan for date: {}", meal_plan_date);

                let meal_plan_name = format!("Meal Plan {}", meal_plan_date.format("%d/%m/%Y"));

                let meal_plan_id: i32 = diesel::insert_into(meal_plans::table)
                    .values((
                        meal_plans::user_id.eq(user_id),
                        meal_plans::name.eq(meal_plan_name),
                        meal_plans::date.eq(meal_plan_date),
                    ))
                    .returning(meal_plans::meal_plan_id)
                    .get_result(conn)?;

                println!("Created meal_plan_id: {}", meal_plan_id);

                for (_, recipe) in day_mealplans.iter().enumerate() {
                    if let Some(recipe_id_str) = &recipe.recipe_id {
                        println!("Processing recipe_id: {}", recipe_id_str);
                        diesel::insert_into(meal_plan_recipes::table)
                            .values((
                                meal_plan_recipes::meal_plan_id.eq(meal_plan_id),
                                meal_plan_recipes::recipe_id.eq(recipe_id_str
                                    .parse::<i32>()
                                    .map_err(|_| diesel::result::Error::RollbackTransaction)?),
                                meal_plan_recipes::ischecked.eq(false),
                            ))
                            .execute(conn)?;
                    }
                }
            }
            Ok(())
        })
    };

    transaction_result.map_err(|err| {
        println!("Failed to create meal plan: {}", err);
        Json(json!({ "status": "error", "message": "Failed to create meal plan" }))
    })?;

    println!("Meal plan created successfully");
    Ok(Json(
        json!({ "status": "success", "message": "Meal plan created successfully" }),
    ))
}

#[axum::debug_handler]
pub async fn get_meal_plan(
    Extension(db_pool): Extension<Arc<DbPool>>,
    Json(payload): Json<GetMealPlanRequest>,
) -> Result<Json<GetMealPlanResponse>, (StatusCode, Json<ErrorResponse>)> {
    let mut conn = db_pool.get().map_err(|err| {
        eprintln!("Failed to connect to the database: {}", err);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: "Failed to connect to the database".to_string(),
            }),
        )
    })?;

    // 1. Fetch user_id from user_line_id
    let user_id: i32 = users::table
        .filter(users::user_line_id.eq(&payload.user_line_id))
        .select(users::user_id)
        .first(&mut conn)
        .map_err(|_| {
            (
                StatusCode::NOT_FOUND,
                Json(ErrorResponse {
                    error: "User not found".to_string(),
                }),
            )
        })?;

    // 2. Build the query
    let mut query = meal_plans::table
        .inner_join(
            meal_plan_recipes::table
                .on(meal_plans::meal_plan_id.eq(meal_plan_recipes::meal_plan_id)),
        )
        .inner_join(recipes::table.on(meal_plan_recipes::recipe_id.eq(recipes::recipe_id)))
        .filter(meal_plans::user_id.eq(user_id))
        .into_boxed();

    if let Some(date_str) = &payload.date {
        let date = NaiveDate::parse_from_str(date_str, "%Y-%m-%d").map_err(|_| {
            (
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse {
                    error: "Invalid date format. Use YYYY-MM-DD".to_string(),
                }),
            )
        })?;
        query = query.filter(meal_plans::date.eq(date));
    }

    // 3. Fetch meal plans
    let results = query
        .select((
            meal_plans::meal_plan_id,
            meal_plans::user_id,
            meal_plans::name,
            meal_plans::date,
            meal_plan_recipes::meal_plan_recipe_id, // Include meal_plan_recipe_id
            meal_plan_recipes::recipe_id,
            recipes::recipe_name,
            recipes::recipe_img_link,
            meal_plan_recipes::ischecked,
        ))
        .load::<(
            i32,
            i32,
            String,
            NaiveDate,
            i32,
            i32,
            String,
            Option<Vec<Option<String>>>,
            Option<bool>,
        )>(&mut conn)
        .map_err(|err| {
            eprintln!("Database error fetching meal plans: {}", err);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: "Error fetching meal plans".to_string(),
                }),
            )
        })?;

    // 4. Organize the data into the desired structure
    let mut meal_plans_map: HashMap<i32, MealPlanEntry> = HashMap::new();
    for (
        meal_plan_id,
        user_id,
        name,
        date,
        meal_plan_recipe_id,
        recipe_id,
        recipe_name,
        recipe_img_link,
        ischecked,
    ) in results
    {
        let meal_plan_entry = meal_plans_map
            .entry(meal_plan_id)
            .or_insert_with(|| MealPlanEntry {
                meal_plan_id,
                user_id,
                name,
                date,
                recipes: Vec::new(),
            });

        meal_plan_entry.recipes.push(RecipeInfo {
            recipe_id,
            recipe_name,
            recipe_img_link: recipe_img_link
                .unwrap_or_default()
                .into_iter()
                .filter_map(|x| x)
                .collect(),
            ischecked,
            meal_plan_recipe_id, // Add meal_plan_recipe_id to the response
        });
    }

    let meal_plans: Vec<MealPlanEntry> = meal_plans_map.into_values().collect();

    Ok(Json(GetMealPlanResponse { meal_plans }))
}
