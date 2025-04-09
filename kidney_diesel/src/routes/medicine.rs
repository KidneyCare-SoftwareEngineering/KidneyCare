use crate::schema::{user_medicines, user_take_medicines, users};
use axum::http::StatusCode;
use axum::{Extension, Json};
use axum::extract::Query;
use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, Pool};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

pub type DbPool = Pool<ConnectionManager<PgConnection>>;

#[derive(Deserialize)]
pub struct GetMedicineRequest {
    pub user_line_id: String,
    pub date: String,
}

#[derive(Deserialize)]
pub struct GetUserMedicinesRequest {
    pub user_line_id: String,
}

#[derive(Deserialize)]
pub struct GetUserMedicinesQuery {
    pub user_line_id: String,
}

#[derive(Deserialize)]
pub struct GetUserTakeMedicinesQuery {
    pub user_line_id: String,
}

#[derive(Deserialize)]
pub struct TakeMedicineRequest {
    pub user_medicine_id: i32,
    pub user_take_medicine_time: String,
    pub is_medicine_taken: Option<bool>, // Optional field
}

#[derive(Serialize)]
pub struct TakeMedicineResponse {
    pub message: String,
}

#[derive(Serialize)]
pub struct ErrorResponse {
    pub error: String,
}

#[derive(Serialize)]
pub struct GetMedicineResponse {
    pub medicines: Vec<Medicine>,
}

#[derive(Serialize, Queryable, Selectable)]
#[diesel(table_name = user_medicines)]
pub struct MedicineInfo {
    pub user_medicine_id: i32,
    pub user_id: i32,
    pub medicine_per_times: f64,
    pub user_medicine_img_link: Option<Vec<Option<String>>>,
    pub medicine_unit: Option<String>,
    pub medicine_name: Option<String>,
    pub medicine_note: Option<String>,
    pub medicine_schedule: Option<Vec<Option<chrono::NaiveDateTime>>>,
    pub medicine_amount: Option<i32>,
}

#[derive(Serialize, Queryable, Selectable)]
#[diesel(table_name = user_take_medicines)]
pub struct UserTakeMedicine {
    pub user_take_medicines_id: i32,
    pub user_medicine_id: Option<i32>,                // Matches Nullable<Int4>
    pub user_take_medicine_time: Option<chrono::NaiveDate>, // Matches Nullable<Date>
    pub is_medicine_taken: Option<bool>,             // Matches Nullable<Bool>
}

#[derive(Serialize)]
pub struct Medicine {
    pub info: MedicineInfo,
    pub taken: UserTakeMedicine,
}

type MedicineRow = (MedicineInfo, UserTakeMedicine);

#[axum::debug_handler]
pub async fn get_all_user_medicines(
    Extension(db_pool): Extension<Arc<DbPool>>,
    Query(query): Query<GetUserMedicinesQuery>,
) -> Result<Json<Vec<MedicineInfo>>, StatusCode> {
    let mut conn = db_pool
        .get()
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Fetch user_id from user_line_id
    let user_id: i32 = users::table
        .filter(users::user_line_id.eq(&query.user_line_id))
        .select(users::user_id)
        .first(&mut conn)
        .map_err(|_| {
            eprintln!("User not found for user_line_id: {}", query.user_line_id);
            StatusCode::NOT_FOUND
        })?;

    // Fetch medicines for the user
    let results = user_medicines::table
        .filter(user_medicines::user_id.eq(user_id))
        .select(MedicineInfo::as_select())
        .load::<MedicineInfo>(&mut conn)
        .map_err(|err| {
            eprintln!("Failed to fetch user medicines: {}", err);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    Ok(Json(results))
}

#[axum::debug_handler]
pub async fn get_all_user_take_medicines(
    Extension(db_pool): Extension<Arc<DbPool>>,
    Query(query): Query<GetUserTakeMedicinesQuery>,
) -> Result<Json<Vec<UserTakeMedicine>>, StatusCode> {
    let mut conn = db_pool
        .get()
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Fetch user_id from user_line_id
    let user_id: i32 = users::table
        .filter(users::user_line_id.eq(&query.user_line_id))
        .select(users::user_id)
        .first(&mut conn)
        .map_err(|_| {
            eprintln!("User not found for user_line_id: {}", query.user_line_id);
            StatusCode::NOT_FOUND
        })?;

    // Fetch user_take_medicines by joining with user_medicines using user_id and filtering is_medicine_taken = true
    let results = user_take_medicines::table
        .inner_join(user_medicines::table.on(user_take_medicines::user_medicine_id.eq(user_medicines::user_medicine_id.nullable())))
        .filter(user_medicines::user_id.eq(user_id))
        .filter(user_take_medicines::is_medicine_taken.eq(Some(true))) // Filter only taken medicines
        .select(UserTakeMedicine::as_select())
        .load::<UserTakeMedicine>(&mut conn)
        .map_err(|err| {
            eprintln!("Failed to fetch user take medicines: {}", err);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    Ok(Json(results))
}

#[axum::debug_handler]
pub async fn take_medicine(
    Extension(db_pool): Extension<Arc<DbPool>>,
    Json(payload): Json<TakeMedicineRequest>,
) -> Result<Json<TakeMedicineResponse>, (StatusCode, Json<ErrorResponse>)> {
    let mut conn = db_pool
        .get()
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: "Failed to connect to the database".to_string(),
                }),
            )
        })?;

    // Log the incoming payload
    eprintln!(
        "Processing take_medicine request: user_medicine_id = {}, user_take_medicine_time = {}, is_medicine_taken = {:?}",
        payload.user_medicine_id,
        payload.user_take_medicine_time,
        payload.is_medicine_taken
    );

    // Parse the date string
    let take_medicine_date = chrono::NaiveDate::parse_from_str(&payload.user_take_medicine_time, "%Y-%m-%d")
        .map_err(|_| {
            eprintln!("Invalid date format: {}", payload.user_take_medicine_time);
            (
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse {
                    error: "Invalid date format. Use YYYY-MM-DD".to_string(),
                }),
            )
        })?;

    // Log the parsed date
    eprintln!("Parsed take_medicine_date: {}", take_medicine_date);

    // Check if the record exists
    let existing_record = user_take_medicines::table
        .filter(
            user_take_medicines::user_medicine_id
                .eq(payload.user_medicine_id)
                .and(user_take_medicines::user_take_medicine_time.eq(Some(take_medicine_date))),
        )
        .first::<UserTakeMedicine>(&mut conn)
        .optional()
        .map_err(|err| {
            eprintln!(
                "Database error checking existing record: user_medicine_id = {}, user_take_medicine_time = {}, error = {}",
                payload.user_medicine_id, take_medicine_date, err
            );
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: "Error checking existing medicine record".to_string(),
                }),
            )
        })?;

    if let Some(_) = existing_record {
        // Update the existing record
        diesel::update(
            user_take_medicines::table.filter(
                user_take_medicines::user_medicine_id
                    .eq(payload.user_medicine_id)
                    .and(user_take_medicines::user_take_medicine_time.eq(Some(take_medicine_date))),
            ),
        )
        .set(user_take_medicines::is_medicine_taken.eq(payload.is_medicine_taken.unwrap_or(false))) // Default to false
        .execute(&mut conn)
        .map_err(|err| {
            eprintln!(
                "Database error updating medicine taken record: user_medicine_id = {}, user_take_medicine_time = {}, error = {}",
                payload.user_medicine_id, take_medicine_date, err
            );
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: "Error updating medicine taken record".to_string(),
                }),
            )
        })?;

        eprintln!(
            "Successfully updated medicine taken record: user_medicine_id = {}, user_take_medicine_time = {}",
            payload.user_medicine_id, take_medicine_date
        );
    } else {
        // Insert a new record
        diesel::insert_into(user_take_medicines::table)
            .values((
                user_take_medicines::user_medicine_id.eq(payload.user_medicine_id),
                user_take_medicines::user_take_medicine_time.eq(Some(take_medicine_date)),
                user_take_medicines::is_medicine_taken.eq(payload.is_medicine_taken.unwrap_or(false)), // Default to false
            ))
            .execute(&mut conn)
            .map_err(|err| {
                eprintln!(
                    "Database error inserting new medicine taken record: user_medicine_id = {}, user_take_medicine_time = {}, error = {}",
                    payload.user_medicine_id, take_medicine_date, err
                );
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ErrorResponse {
                        error: "Error inserting new medicine taken record".to_string(),
                    }),
                )
            })?;

        eprintln!(
            "Successfully inserted new medicine taken record: user_medicine_id = {}, user_take_medicine_time = {}",
            payload.user_medicine_id, take_medicine_date
        );
    }

    Ok(Json(TakeMedicineResponse {
        message: "Medicine taken record processed successfully".to_string(),
    }))
}
