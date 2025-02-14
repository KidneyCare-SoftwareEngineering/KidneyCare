use axum::Extension;
// routes/user.rs
use axum::{extract::State, http::StatusCode, Json};
use chrono::{Datelike, NaiveDate, Utc};
use serde_json::{json, Value};
use sqlx::{PgPool, Transaction};

use crate::models::user::CreateUser;
use crate::db::queries::{insert_user, insert_nutrient_limits, insert_user_relations};

pub async fn create_user(
    Extension(pg_pool): Extension<PgPool>,
    Json(payload): Json<CreateUser>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, String)> {
    let mut tx = pg_pool.begin().await.map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to start transaction".to_string(),
        )
    })?;

    let birthdate_str = payload.birthdate.date().to_string();
    let birthdate = NaiveDate::parse_from_str(&birthdate_str, "%Y-%m-%d").map_err(|_| {
        (
            StatusCode::BAD_REQUEST,
            "Invalid birthdate format".to_string(),
        )
    })?;
    let age = Utc::now().naive_utc().year() - birthdate.year();

    let kidney_level = payload.kidney_level.ok_or((StatusCode::BAD_REQUEST, "kidney_level is required".to_string()))?;
    let kidney_dialysis = payload.kidney_dialysis.ok_or((StatusCode::BAD_REQUEST, "kidney_dialysis is required".to_string()))?;

    // Insert user into the database
    let user_id = insert_user(&payload, &mut tx).await?;
    insert_nutrient_limits(user_id, payload.weight as f32, age, kidney_level, kidney_dialysis, &mut tx).await?;
    insert_user_relations(user_id, &payload, &mut tx).await?;

    tx.commit().await.map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to commit transaction".to_string(),
        )
    })?;

    Ok((StatusCode::CREATED, Json(json!({ "user_id": user_id }))))
}
