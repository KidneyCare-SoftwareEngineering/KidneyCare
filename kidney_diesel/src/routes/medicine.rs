// use crate::schema::{user_medicines, user_take_medicines, users};
// use axum::http::StatusCode;
// use axum::{Extension, Json, extract::Query};
// use chrono::{NaiveDate, NaiveTime, Datelike, Timelike, Local};
// use diesel::prelude::*;
// use diesel::r2d2::{ConnectionManager, Pool};
// use serde::{Deserialize, Serialize};
// use std::sync::Arc;
// use serde_json::json;
// use diesel::Queryable;
// use diesel::Selectable;

// pub type DbPool = Pool<ConnectionManager<PgConnection>>;

// #[derive(Deserialize, Debug)]
// pub struct GetMedicineRequest {
//     pub user_line_id: String,
//     pub date: String,
// }

// #[derive(Serialize, Debug)]
// pub struct MedicineInfo {
//     pub user_medicine_id: i32,
//     pub user_id: i32,
//     pub medicine_schedule: Vec<String>,
//     pub medicine_amount: Option<i32>,
//     pub medicine_per_times: f64,
//     pub user_medicine_img_link: Option<Vec<String>>,
//     pub medicine_unit: Option<String>,
//     pub medicine_name: Option<String>,
//     pub medicine_note: Option<String>,
//     pub is_medicine_taken: Option<bool>,
// }

// #[derive(Serialize, Debug)]
// pub struct GetMedicineResponse {
//     pub medicines: Vec<MedicineInfo>,
// }

// #[derive(Queryable, Selectable)]
// #[diesel(table_name = user_medicines)] // Ensure this matches the correct table in your schema
// struct MedicineQueryResult {
//     user_medicine_id: i32,
//     user_id: i32,
//     medicine_schedule: Option<Vec<Option<chrono::NaiveTime>>>,
//     medicine_amount: Option<i32>,
//     medicine_per_times: f64,
//     user_medicine_img_link: Option<Vec<Option<String>>>,
//     medicine_unit: Option<String>,
//     medicine_name: Option<String>,
//     medicine_note: Option<String>,
// }

// #[axum::debug_handler]
// pub async fn get_medicine(
//     Extension(db_pool): Extension<Arc<DbPool>>,
//     Query(params): Query<GetMedicineRequest>,
// ) -> Result<Json<GetMedicineResponse>, (StatusCode, Json<serde_json::Value>)> {
//     let mut conn = db_pool.get().map_err(|err| {
//         eprintln!("Failed to connect to the database: {}", err);
//         (
//             StatusCode::INTERNAL_SERVER_ERROR,
//             Json(json!({ "error": "Failed to connect to the database" })),
//         )
//     })?;

//     // 1. Fetch user_id from user_line_id
//     let user_id: i32 = users::table
//         .filter(users::user_line_id.eq(&params.user_line_id))
//         .select(users::user_id)
//         .first(&mut conn)
//         .map_err(|_| {
//             (
//                 StatusCode::NOT_FOUND,
//                 Json(json!({ "error": "User not found" })),
//             )
//         })?;

//     // 2. Parse the date
//     let date = NaiveDate::parse_from_str(&params.date, "%Y-%m-%d").map_err(|_| {
//         (
//             StatusCode::BAD_REQUEST,
//             Json(json!({ "error": "Invalid date format. Use YYYY-MM-DD" })),
//         )
//     })?;

//     // 3. Fetch user medicines and join with user_take_medicines
//     let medicine_data = user_medicines::table
//         .left_join(
//             user_take_medicines::table.on(user_medicines::user_medicine_id.nullable().eq(user_take_medicines::user_medicine_id)),
//         )
//         .filter(user_medicines::user_id.eq(user_id))
//         .filter(user_take_medicines::user_take_medicine_time.eq(Some(date)))
//         .select(MedicineQueryResult::as_select()) // Use as_select for better compatibility
//         .load::<MedicineQueryResult>(&mut conn)
//         .map_err(|err| {
//             eprintln!("Database error fetching medicines: {}", err);
//             (
//                 StatusCode::INTERNAL_SERVER_ERROR,
//                 Json(json!({ "error": "Error fetching medicines" })),
//             )
//         })?;

//     // 4. Organize the data into the desired structure
//     let medicines: Vec<MedicineInfo> = medicine_data
//         .into_iter()
//         .map(|medicine| {
//             let schedule_strings: Vec<String> = medicine.medicine_schedule
//                 .unwrap_or_default()
//                 .into_iter()
//                 .filter_map(|time_option| {
//                     time_option.map(|time| time.format("%H:%M").to_string())
//                 })
//                 .collect();

//             let img_link: Option<Vec<String>> = medicine.user_medicine_img_link.map(|links| {
//                 links.into_iter().filter_map(|link| link).collect()
//             });

//             MedicineInfo {
//                 user_medicine_id: medicine.user_medicine_id,
//                 user_id: medicine.user_id,
//                 medicine_schedule: schedule_strings,
//                 medicine_amount: medicine.medicine_amount,
//                 medicine_per_times: medicine.medicine_per_times,
//                 user_medicine_img_link: img_link,
//                 medicine_unit: medicine.medicine_unit,
//                 medicine_name: medicine.medicine_name,
//                 medicine_note: medicine.medicine_note,
//                 is_medicine_taken: medicine.is_medicine_taken,
//             }
//         })
//         .collect();

//     Ok(Json(GetMedicineResponse { medicines }))
// }
