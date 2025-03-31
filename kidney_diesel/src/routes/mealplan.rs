use axum::{Extension, Json};
// use axum::http::StatusCode;
use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, Pool};
use serde::Deserialize;
use std::sync::Arc;
use serde_json::json;
use crate::schema::{meal_plans, meal_plan_recipes, users};

#[derive(Deserialize, Debug)]
pub struct Recipe {
    pub recipe_id: Option<String>, // recipe_id is optional as it might be missing
}

#[derive(Deserialize, Debug)]
pub struct CreateMealPlanPayload {
    pub user_line_id: String,      // The user_line_id field
    pub mealplans: Vec<Vec<Recipe>>, // A 2D vector representing the meal plans
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

    let user_id: i32 = users::table
        .filter(users::user_line_id.eq(&payload.user_line_id))
        .select(users::user_id)
        .first(&mut conn)
        .map_err(|err| {
            println!("Failed to fetch user: {}", err);
            Json(json!({ "status": "error", "message": "User not found" }))
        })?;

    println!("Fetched user_id: {}", user_id);

    let transaction_result = {
        let conn = &mut conn;
        conn.transaction::<_, diesel::result::Error, _>(|conn| {
            for (day_index, day_mealplans) in payload.mealplans.iter().enumerate() {
                println!("Processing day {}: {:?}", day_index + 1, day_mealplans);

                let today = chrono::Local::now().date_naive();
                let meal_plan_date = today + chrono::Duration::days(day_index as i64);
                println!("Calculated meal_plan_date: {}", meal_plan_date);

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
                                meal_plan_recipes::recipe_id.eq(recipe_id_str.parse::<i32>().map_err(|_| diesel::result::Error::RollbackTransaction)?),
                                meal_plan_recipes::ischecked.eq(false),
                            ))
                            .execute(conn)?;
                    }
                }
            }
            Ok(())
        })
    };

    transaction_result
        .map_err(|err| {
            println!("Failed to create meal plan: {}", err);
            Json(json!({ "status": "error", "message": "Failed to create meal plan" }))
        })?;

    println!("Meal plan created successfully");
    Ok(Json(json!({ "status": "success", "message": "Meal plan created successfully" })))
}