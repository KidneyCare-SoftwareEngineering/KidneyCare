use axum::{Extension, Json, extract::Query};
use axum::http::StatusCode;
use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, Pool};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use chrono::{NaiveDateTime, Utc, Datelike};
use crate::schema::users::dsl::*;
use crate::schema::{users_nutrients_limit_per_day, nutrients, meal_plans, meal_plan_recipes, recipes_nutrients};
use diesel::associations::HasTable; // Import HasTable to resolve `.table()`

pub type DbPool = Pool<ConnectionManager<PgConnection>>;

#[derive(Queryable)]
struct User {
    pub gender: Option<String>,
    pub birthdate: NaiveDateTime,
    pub height: f64,
    pub kidney_level: Option<i32>,
    pub weight: f64,
}

#[derive(Deserialize)]
pub struct GetUserInfoParams {
    pub user_line_id: String,
}

#[derive(Serialize)]
pub struct UserInfoResponse {
    pub gender: Option<String>,
    pub birthdate: NaiveDateTime,
    pub age: i32,
    pub height: f64,
    pub kidney_level: Option<i32>,
    pub weight: f64,
    pub calories_limit: Option<f64>,
    pub nutrients_limit: std::collections::HashMap<String, f64>,
}

pub async fn get_user_info(
    Extension(db_pool): Extension<Arc<DbPool>>,
    Query(params): Query<GetUserInfoParams>,
) -> Result<Json<UserInfoResponse>, StatusCode> {
    let mut conn = db_pool.get().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let user_data: User = users
        .filter(user_line_id.eq(Some(params.user_line_id.clone())))
        .select((gender, birthdate, height, kidney_level, weight))
        .first::<User>(&mut conn)
        .map_err(|_| StatusCode::NOT_FOUND)?;

    // Fetch user's nutrient limits
    let nutrient_limits = users_nutrients_limit_per_day::table
        .inner_join(nutrients::table.on(users_nutrients_limit_per_day::nutrient_id.eq(nutrients::nutrient_id.nullable()))); // Use `.nullable()` to match types
        let user_id_value: i32 = users
            .filter(user_line_id.eq(Some(params.user_line_id.clone())))
            .select(user_id)
            .first::<i32>(&mut conn)
            .map_err(|_| StatusCode::NOT_FOUND)?;
    
        let nutrient_limits = users_nutrients_limit_per_day::table
            .inner_join(nutrients::table.on(users_nutrients_limit_per_day::nutrient_id.eq(nutrients::nutrient_id.nullable())))
            .filter(users_nutrients_limit_per_day::user_id.eq(user_id_value))
        .select((nutrients::name, users_nutrients_limit_per_day::nutrient_limit))
        .load::<(String, Option<f64>)>(&mut conn)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let mut nutrients_limit = std::collections::HashMap::new();
    let mut calories_limit = None;

    for (nutrient_name, limit) in nutrient_limits {
        if nutrient_name.to_lowercase() == "calories" {
            calories_limit = limit;
        } else if let Some(limit_value) = limit {
            nutrients_limit.insert(nutrient_name, limit_value);
        }
    }

    let now = Utc::now().naive_utc().date();
    let birth = user_data.birthdate.date();
    let mut age = now.year() - birth.year();
    if now.ordinal() < birth.ordinal() {
        age -= 1;
    }

    let response = UserInfoResponse {
        gender: user_data.gender,
        birthdate: user_data.birthdate,
        age,
        height: user_data.height,
        kidney_level: user_data.kidney_level,
        weight: user_data.weight,
        calories_limit,
        nutrients_limit,
    };

    Ok(Json(response))
}

#[derive(Deserialize)]
pub struct SumNutrientsByDateParams {
    pub user_line_id: String,
    pub date: NaiveDateTime,
}

#[derive(Serialize)]
pub struct NutrientsSummaryResponse {
    pub nutrients_summary: std::collections::HashMap<String, f64>,
}

pub async fn sum_nutrients_by_date(
    Extension(db_pool): Extension<Arc<DbPool>>,
    Json(params): Json<SumNutrientsByDateParams>,
) -> Result<Json<NutrientsSummaryResponse>, StatusCode> {
    let mut conn = db_pool.get().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Get user_id from user_line_id
    let user_id_value: i32 = users
        .filter(user_line_id.eq(Some(params.user_line_id.clone())))
        .select(user_id)
        .first::<i32>(&mut conn)
        .map_err(|_| StatusCode::NOT_FOUND)?;

    // Join meal_plans, meal_plan_recipes, and recipes_nutrients to calculate nutrient sums
    let nutrient_sums = meal_plans::table
        .inner_join(meal_plan_recipes::table.on(meal_plans::meal_plan_id.eq(meal_plan_recipes::meal_plan_id)))
        .inner_join(recipes_nutrients::table.on(meal_plan_recipes::recipe_id.eq(recipes_nutrients::recipe_id)))
        .filter(meal_plans::user_id.eq(user_id_value))
        .filter(meal_plans::date.eq(params.date.date()))
        .filter(meal_plan_recipes::ischecked.eq(true)) // Only include checked meal plan recipes
        .group_by(recipes_nutrients::nutrient_id)
        .select((recipes_nutrients::nutrient_id, diesel::dsl::sum(recipes_nutrients::quantity)))
        .load::<(i32, Option<f64>)>(&mut conn)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Map nutrient IDs to their names and build the response
    let mut nutrients_summary = std::collections::HashMap::new();
    for (nutrient_id, sum) in nutrient_sums {
        if let Some(sum_value) = sum {
            let nutrient_name: String = nutrients::table
                .filter(nutrients::nutrient_id.eq(nutrient_id))
                .select(nutrients::name)
                .first::<String>(&mut conn)
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
            nutrients_summary.insert(nutrient_name, sum_value);
        }
    }

    let response = NutrientsSummaryResponse { nutrients_summary };
    Ok(Json(response))
}
