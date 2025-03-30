use axum::{Extension, Json};
// use axum::http::StatusCode;
use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, Pool};
use serde::Deserialize;
use std::sync::Arc;
use serde_json::json;
use crate::schema::{meal_plans, meal_plan_recipes, users, recipes_nutrients, nutrients, recipes};

#[derive(Deserialize, Debug)]
pub struct Recipe {
    pub recipe_id: Option<String>, // recipe_id is optional as it might be missing
}

#[derive(Deserialize, Debug)]
pub struct CreateMealPlanPayload {
    pub user_line_id: String,      // The user_line_id field
    pub days: i32,                 // The number of days for the meal plan
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

                let today = chrono::Local::now().naive_local().date();
                let meal_plan_date = today + chrono::Duration::days(day_index as i64);
                let meal_plan_name = format!("Meal Plan {}", meal_plan_date.format("%d:%m:%y"));

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

#[axum::debug_handler]
pub async fn update_meal_plan(
    Extension(db_pool): Extension<Arc<DbPool>>,
    Json(payload): Json<CreateMealPlanPayload>,
) -> Result<Json<serde_json::Value>, Json<serde_json::Value>> {
    println!("Received payload: {:?}", payload);

    if payload.user_line_id.is_empty() {
        println!("Missing field `user_line_id`");
        return Err(Json(json!({ "status": "error", "message": "Missing field `user_line_id`" })));
    }

    let mut conn = db_pool.get().map_err(|err| {
        println!("Failed to connect to the database: {}", err);
        Json(json!({ "status": "error", "message": "Failed to connect to the database" }))
    })?;

    let mut enriched_mealplans = vec![];

    for (day_index, day_mealplans) in payload.mealplans.iter().enumerate() {
        println!("Processing day {}: {:?}", day_index + 1, day_mealplans);
        let mut enriched_day = vec![];

        for recipe in day_mealplans.iter() {
            match &recipe.recipe_id {
                Some(recipe_id_str) if !recipe_id_str.is_empty() => {
                    if let Ok(recipe_id) = recipe_id_str.parse::<i32>() {
                        println!("Processing valid recipe_id: {}", recipe_id);

                        // Fetch recipe data including calories
                        let recipe_data = recipes::table
                            .filter(recipes::recipe_id.eq(recipe_id))
                            .select((recipes::recipe_name, recipes::recipe_img_link, recipes::calories))
                            .first::<(String, Option<Vec<Option<String>>>, Option<f64>)>(&mut conn)
                            .map_err(|err| {
                                println!("Failed to fetch recipe data for recipe_id {}: {}", recipe_id, err);
                                Json(json!({ "status": "error", "message": "Recipe not found" }))
                            })?;

                        // Fetch nutrition data
                        let nutrition_data = recipes_nutrients::table
                            .filter(recipes_nutrients::recipe_id.eq(recipe_id))
                            .inner_join(nutrients::table.on(recipes_nutrients::nutrient_id.eq(nutrients::nutrient_id)))
                            .select((nutrients::name, recipes_nutrients::quantity))
                            .load::<(String, f64)>(&mut conn)
                            .map_err(|err| {
                                println!("Failed to fetch nutrition data for recipe_id {}: {}", recipe_id, err);
                                Json(json!({ "status": "error", "message": "Nutrition data not found" }))
                            })?;

                        // Map nutrition data
                        let mut nutrition = serde_json::Map::new();
                        for (nutrient_name, quantity) in nutrition_data {
                            nutrition.insert(nutrient_name, json!(quantity));
                        }

                        enriched_day.push(json!({
                            "name": recipe_data.0,
                            "nutrition": nutrition,
                            "recipe_id": recipe_id_str,
                            "recipe_img_link": recipe_data.1.unwrap_or_default().into_iter().filter_map(|x| x).collect::<Vec<String>>(),
                            "calories": recipe_data.2.unwrap_or(0.0) // Include calories
                        }));
                    } else {
                        println!("Invalid recipe_id: {}", recipe_id_str);
                        enriched_day.push(json!({})); // Invalid recipe_id, add empty object
                    }
                }
                _ => {
                    // If recipe_id is None or invalid, skip it and add an empty object
                    enriched_day.push(json!({})); // Add empty object for missing or invalid recipe_id
                }
            }
        }

        enriched_mealplans.push(enriched_day);
    }

    println!("Constructed enriched mealplans: {:?}", enriched_mealplans);

    let enriched_payload = json!({
        "mealplans": enriched_mealplans,
        "user_id": payload.user_line_id, // Rename user_line_id to user_id in the response
        "days": payload.days             // Include the days field in the payload
    });

    println!("Constructed enriched payload: {:?}", enriched_payload);

    let client = reqwest::Client::new();
    let response = client
        .post("https://ai-rec-1025044834972.asia-southeast1.run.app/ai_update")
        .json(&enriched_payload)
        .send()
        .await
        .map_err(|err| {
            println!("Failed to send request to AI service: {}", err);
            Json(json!({ "status": "error", "message": "Failed to fetch AI update" }))
        })?;

    println!("Received response from AI service");

    let result = response.json::<serde_json::Value>().await.map_err(|err| {
        println!("Failed to parse response from AI service: {}", err);
        Json(json!({ "status": "error", "message": "Invalid response from AI update" }))
    })?;

    println!("Parsed AI response: {:?}", result);

    Ok(Json(result))
}