use axum::{Extension, Json, extract::Query};
use axum::http::StatusCode;
use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, Pool};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use chrono::{NaiveDateTime, Utc, Datelike};
use crate::schema::users::dsl::*;
use crate::schema::{users_nutrients_limit_per_day, nutrients};
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
