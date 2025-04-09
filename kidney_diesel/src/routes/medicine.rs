use crate::schema::{user_medicines, user_take_medicines, users};
use axum::http::StatusCode;
use axum::{Extension, Json};
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
) -> Result<Json<Vec<MedicineInfo>>, StatusCode> {
    let mut conn = db_pool
        .get()
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let results = user_medicines::table
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
) -> Result<Json<Vec<UserTakeMedicine>>, StatusCode> {
    let mut conn = db_pool
        .get()
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let results = user_take_medicines::table
        .select(UserTakeMedicine::as_select())
        .load::<UserTakeMedicine>(&mut conn)
        .map_err(|err| {
            eprintln!("Failed to fetch user take medicines: {}", err);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    Ok(Json(results))
}

// #[axum::debug_handler]
// pub async fn get_medicine(
//     Extension(db_pool): Extension<Arc<DbPool>>,
//     Json(payload): Json<GetMedicineRequest>,
// ) -> Result<Json<GetMedicineResponse>, (StatusCode, Json<serde_json::Value>)> {
//     let mut conn = db_pool.get().map_err(|err| {
//         eprintln!("Failed to connect to the database: {}", err);
//         (
//             StatusCode::INTERNAL_SERVER_ERROR,
//             Json(serde_json::json!({ "error": "Failed to connect to the database" })),
//         )
//     })?;

//     // 1. Fetch user_id from user_line_id
//     let user_id: i32 = users::table
//         .filter(users::user_line_id.eq(&payload.user_line_id))
//         .select(users::user_id)
//         .first(&mut conn)
//         .map_err(|_| {
//             (
//                 StatusCode::NOT_FOUND,
//                 Json(serde_json::json!({ "error": "User not found" })),
//             )
//         })?;

//     // 2. Parse the date
//     let date = chrono::NaiveDate::parse_from_str(&payload.date, "%Y-%m-%d").map_err(|_| {
//         (
//             StatusCode::BAD_REQUEST,
//             Json(serde_json::json!({ "error": "Invalid date format. Use YYYY-MM-DD" })),
//         )
//     })?;

//     // 3. Fetch user medicines and join with user_take_medicines
//     let results = user_medicines::table
//         .left_join(
//             user_take_medicines::table.on(user_medicines::user_medicine_id
//                 .nullable()
//                 .eq(user_take_medicines::user_medicine_id)
//                 .and(user_take_medicines::user_take_medicine_time.eq(Some(date)))),
//         )
//         .filter(user_medicines::user_id.eq(user_id))
//         .select((MedicineInfo::as_select(), UserTakeMedicine::as_select()))
//         .load::<MedicineRow>(&mut conn)
//         .map_err(|err| {
//             eprintln!("Database error fetching medicines: {}", err);
//             (
//                 StatusCode::INTERNAL_SERVER_ERROR,
//                 Json(serde_json::json!({ "error": "Error fetching medicines" })),
//             )
//         })?;

//     let medicines: Vec<Medicine> = results
//         .into_iter()
//         .map(|row| Medicine {
//             info: row.info,
//             taken: row.taken,
//         })
//         .collect();

//     Ok(Json(GetMedicineResponse { medicines }))
// }
