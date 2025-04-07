use crate::schema::{user_medicines, user_take_medicines, users};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use axum::{Extension, Json};
use axum::http::StatusCode;
use std::sync::Arc;
use diesel::r2d2::{ConnectionManager, Pool};

pub type DbPool = Pool<ConnectionManager<PgConnection>>;

#[derive(Deserialize)]
pub struct GetMedicineRequest {
    pub user_line_id: String,
    pub date: String,
}

#[derive(Serialize)]
pub struct GetMedicineResponse {
    pub medicines: Vec<MedicineInfo>,
}

#[derive(Serialize)]
pub struct MedicineInfo {
    pub user_medicine_id: i32,
    pub user_id: i32,
    pub medicine_schedule: Vec<String>,
    pub medicine_amount: Option<i32>,
    pub medicine_per_times: f64,
    pub user_medicine_img_link: Option<Vec<String>>,
    pub medicine_unit: Option<String>,
    pub medicine_name: Option<String>,
    pub medicine_note: Option<String>,
    pub is_medicine_taken: Option<bool>,
}

#[axum::debug_handler]
pub async fn get_medicine(
    Extension(db_pool): Extension<Arc<DbPool>>,
    Json(payload): Json<GetMedicineRequest>,
) -> Result<Json<GetMedicineResponse>, (StatusCode, Json<serde_json::Value>)> {
    let mut conn = db_pool.get().map_err(|err| {
        eprintln!("Failed to connect to the database: {}", err);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": "Failed to connect to the database" })),
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
                Json(serde_json::json!({ "error": "User not found" })),
            )
        })?;

    // 2. Parse the date
    let date = chrono::NaiveDate::parse_from_str(&payload.date, "%Y-%m-%d").map_err(|_| {
        (
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({ "error": "Invalid date format. Use YYYY-MM-DD" })),
        )
    })?;

    // 3. Fetch user medicines and join with user_take_medicines
    let results = user_medicines::table
        .left_join(
            user_take_medicines::table.on(user_medicines::user_medicine_id.nullable().eq(user_take_medicines::user_medicine_id)),
        )
        .filter(user_medicines::user_id.eq(user_id))
        .filter(user_take_medicines::user_take_medicine_time.eq(Some(date)))
        .select((
            user_medicines::user_medicine_id,
            user_medicines::user_id,
            user_medicines::medicine_schedule,
            user_medicines::medicine_amount,
            user_medicines::medicine_per_times,
            user_medicines::user_medicine_img_link,
            user_medicines::medicine_unit,
            user_medicines::medicine_name,
            user_medicines::medicine_note,
            user_take_medicines::is_medicine_taken.nullable(),
        ))
        .load::<(
            i32,
            i32,
            Option<Vec<Option<chrono::NaiveTime>>>,
            Option<i32>,
            f64,
            Option<Vec<Option<String>>>,
            Option<String>,
            Option<String>,
            Option<String>,
            Option<bool>,
        )>(&mut conn)
        .map_err(|err| {
            eprintln!("Database error fetching medicines: {}", err);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": "Error fetching medicines" })),
            )
        })?;

    // 4. Organize the data into the desired structure
    let medicines: Vec<MedicineInfo> = results
        .into_iter()
        .map(
            |(
                user_medicine_id,
                user_id,
                medicine_schedule,
                medicine_amount,
                medicine_per_times,
                user_medicine_img_link,
                medicine_unit,
                medicine_name,
                medicine_note,
                is_medicine_taken,
            )| {
                let schedule_strings: Vec<String> = medicine_schedule
                    .unwrap_or_default()
                    .into_iter()
                    .filter_map(|time_option| time_option.map(|time| time.format("%H:%M").to_string()))
                    .collect();

                let img_links: Option<Vec<String>> = user_medicine_img_link.map(|links| {
                    links.into_iter().filter_map(|link| link).collect()
                });

                MedicineInfo {
                    user_medicine_id,
                    user_id,
                    medicine_schedule: schedule_strings,
                    medicine_amount,
                    medicine_per_times,
                    user_medicine_img_link: img_links,
                    medicine_unit,
                    medicine_name,
                    medicine_note,
                    is_medicine_taken,
                }
            },
        )
        .collect();

    Ok(Json(GetMedicineResponse { medicines }))
}
