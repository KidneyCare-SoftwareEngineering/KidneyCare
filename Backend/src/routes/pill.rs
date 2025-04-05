use axum::{extract::Multipart, extract::Query, Extension, Json};
use chrono::{NaiveDateTime, ParseError};
use image::io::Reader as ImageReader;
use reqwest::{Client, StatusCode};
use serde::{Deserialize, Serialize};
use sqlx::postgres::PgPool;
use std::io::Cursor;
use std::time::Instant;
use std::collections::HashMap;
use sqlx::FromRow;
use chrono::NaiveDate;
use chrono::Datelike;
// use chrono::Date;
use chrono::TimeZone;

#[derive(Deserialize, Serialize)]
pub struct UploadResponse {
    #[serde(rename = "imageUrls")]
    image_urls: Vec<String>,
    medicine_name: String,
    medicine_amount: i32,
    medicine_per_times: f32,
    medicine_schedule: Vec<String>,
    medicine_note: String,
    medicine_unit: String,
}

#[derive(Deserialize, Serialize)]
pub struct ErrorResponse {
    error: String,
}

#[derive(Serialize)]
pub struct MedicineResponse {
    medicines: Vec<MedicineEntry>,
}

#[derive(Deserialize)]
pub struct UserQuery {
    user_line_id: String,
}

#[derive(Serialize, FromRow)]
pub struct MedicineEntry {
    user_medicine_id: i32,
    medicine_schedule: Vec<NaiveDateTime>,
    medicine_amount: Option<i32>,
    medicine_per_times: f64,
    user_medicine_img_link: Vec<String>,
    medicine_unit: Option<String>,
    medicine_name: Option<String>,
    medicine_note: Option<String>,
}

const MAX_IMAGE_SIZE: usize = 30 * 1024 * 1024;
const UPLOAD_URL: &str = "https://supabase-uploader.fly.dev/image";

fn parse_schedule_to_timestamps(schedule: Vec<String>) -> Result<Vec<NaiveDateTime>, ParseError> {
    schedule
        .into_iter()
        .map(|s| {
            let parsed = NaiveDateTime::parse_from_str(&s, "%Y-%m-%dT%H:%M:%S")?;
            Ok(parsed)
        })
        .collect()
}

async fn get_user_id_by_line_id(db_pool: &PgPool, user_line_id: &str) -> Result<i32, String> {
    let query = r#"
        SELECT user_id FROM users WHERE user_line_id = $1
    "#;

    let user_id: (i32,) = sqlx::query_as(query)
        .bind(user_line_id)
        .fetch_one(db_pool)
        .await
        .map_err(|e| format!("Error fetching user_id: {}", e))?;

    Ok(user_id.0)
}

pub async fn upload_image_to_supabase(
    image_data: Vec<u8>,
    file_name: &str,
) -> Result<Vec<String>, String> {
    let start = Instant::now();
    let client = Client::new();
    let form = reqwest::multipart::Form::new().part(
        "image",
        reqwest::multipart::Part::bytes(image_data).file_name(file_name.to_string()),
    );

    let response = client
        .post(UPLOAD_URL)
        .multipart(form)
        .send()
        .await
        .map_err(|e| format!("Failed to send request: {}", e))?;

    if !response.status().is_success() {
        return Err(format!(
            "Supabase upload failed with status: {}",
            response.status()
        ));
    }

    let response_text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response text: {}", e))?;

    let upload_response: serde_json::Value = serde_json::from_str(&response_text)
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    let image_urls = upload_response["imageUrls"]
        .as_array()
        .ok_or_else(|| "Missing field `imageUrls` in response".to_string())?
        .iter()
        .map(|url| url.as_str().unwrap_or_default().to_string())
        .collect();

    Ok(image_urls)
}

pub async fn insert_medicine_to_db(
    db_pool: &PgPool,
    user_id: i32,
    image_urls: &[String],
    medicine_name: &str,
    medicine_amount: i32,
    medicine_per_times: f32,
    medicine_schedule: &[NaiveDateTime],
    medicine_note: &str,
    medicine_unit: &str,
) -> Result<(), String> {
    let query = r#"
        INSERT INTO user_medicines (
            user_id, medicine_schedule, medicine_amount, 
            medicine_per_times, user_medicine_img_link, 
            medicine_unit, medicine_name, medicine_note
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    "#;

    let result = sqlx::query(query)
        .bind(user_id)
        .bind(medicine_schedule)
        .bind(medicine_amount)
        .bind(medicine_per_times)
        .bind(image_urls)
        .bind(medicine_unit)
        .bind(medicine_name)
        .bind(medicine_note)
        .execute(db_pool)
        .await
        .map_err(|e| format!("Error inserting into user_medicines: {}", e))?;

    if result.rows_affected() == 0 {
        return Err("No rows affected in database".to_string());
    }

    Ok(())
}

#[axum::debug_handler]
pub async fn handle_image_upload(
    Extension(db_pool): Extension<PgPool>,
    mut multipart: Multipart,
) -> Result<Json<UploadResponse>, (StatusCode, Json<ErrorResponse>)> {
    let mut image_urls = Vec::new();
    let mut medicine_name = String::new();
    let mut medicine_amount = 0;
    let mut medicine_per_times = 0.0;
    let mut medicine_schedule = Vec::new();
    let mut medicine_note = String::new();
    let mut medicine_unit = String::new();
    let mut user_line_id = String::new();

    while let Some(field) = multipart.next_field().await.unwrap() {
        match field.name() {
            Some("image") => {
                let file_name = field.file_name().unwrap_or("image.jpg").to_string();
                let data = field.bytes().await.unwrap();

                if data.len() > MAX_IMAGE_SIZE {
                    return Err((
                        StatusCode::PAYLOAD_TOO_LARGE,
                        Json(ErrorResponse {
                            error: "Image size exceeds 30MB limit".to_string(),
                        }),
                    ));
                }

                if let Err(e) = ImageReader::new(Cursor::new(&data)).with_guessed_format() {
                    return Err((
                        StatusCode::BAD_REQUEST,
                        Json(ErrorResponse {
                            error: format!("Invalid file type: {}", e),
                        }),
                    ));
                }

                let image_data = data.to_vec();
                match upload_image_to_supabase(image_data, &file_name).await {
                    Ok(urls) => image_urls.extend(urls),
                    Err(e) => {
                        return Err((
                            StatusCode::INTERNAL_SERVER_ERROR,
                            Json(ErrorResponse { error: e }),
                        ))
                    }
                }
            }
            Some("medicine_name") => medicine_name = field.text().await.unwrap(),
            Some("medicine_amount") => {
                medicine_amount = field.text().await.unwrap().parse().unwrap_or(0)
            }
            Some("medicine_per_times") => {
                medicine_per_times = field.text().await.unwrap().parse().unwrap_or(0.0)
            }
            Some("medicine_schedule") => {
                medicine_schedule =
                    serde_json::from_str(&field.text().await.unwrap()).unwrap_or_default()
            }
            Some("medicine_note") => medicine_note = field.text().await.unwrap(),
            Some("medicine_unit") => medicine_unit = field.text().await.unwrap(),
            Some("user_line_id") => user_line_id = field.text().await.unwrap(),
            _ => {}
        }
    }

    let user_id = get_user_id_by_line_id(&db_pool, &user_line_id)
        .await
        .map_err(|e| (StatusCode::BAD_REQUEST, Json(ErrorResponse { error: e })))?;
    let parsed_schedule = parse_schedule_to_timestamps(medicine_schedule.clone()).map_err(|e| {
        (
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: format!("Failed to parse schedule: {}", e),
            }),
        )
    })?;

    insert_medicine_to_db(
        &db_pool,
        user_id,
        &image_urls,
        &medicine_name,
        medicine_amount,
        medicine_per_times,
        &parsed_schedule,
        &medicine_note,
        &medicine_unit,
    )
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse { error: e }),
        )
    })?;

    Ok(Json(UploadResponse {
        image_urls,
        medicine_name,
        medicine_amount,
        medicine_per_times,
        medicine_schedule,
        medicine_note,
        medicine_unit,
    }))
}

pub async fn get_pill_by_user_line_id(
    Extension(db_pool): Extension<PgPool>,
    Query(params): Query<UserQuery>,
) -> Result<Json<MedicineResponse>, (axum::http::StatusCode, Json<HashMap<&'static str, String>>)> {
    let user_id = match get_user_id_by_line_id(&db_pool, &params.user_line_id).await {
        Ok(id) => id,
        Err(e) => {
            let mut error_response = HashMap::new();
            error_response.insert("error", e);
            return Err((axum::http::StatusCode::BAD_REQUEST, Json(error_response)));
        }
    };

    let query = r#"
        SELECT user_medicine_id, medicine_schedule, medicine_amount, medicine_per_times, 
               user_medicine_img_link, medicine_unit, medicine_name, medicine_note
        FROM user_medicines WHERE user_id = $1
    "#;

    let medicines = sqlx::query_as::<_, MedicineEntry>(query)
        .bind(user_id)
        .fetch_all(&db_pool)
        .await
        .map_err(|e| {
            let mut error_response = HashMap::new();
            error_response.insert("error", format!("Error fetching medicines: {}", e));
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(error_response))
        })?;

    Ok(Json(MedicineResponse { medicines }))
}

// Define the request body structure
#[derive(Deserialize)]
pub struct GetMedicineRequest {
    pub user_line_id: String,
    pub date: Option<String>, // JS datetime string (e.g., "1990-01-01T12:00:00") - Optional for filtering
}

// Define the response structure for a single medicine entry
#[derive(Serialize, FromRow)]
pub struct UserMedicine {
    pub user_medicine_id: i32,
    pub user_id: i32,
    pub medicine_schedule: Vec<NaiveDateTime>, // Use NaiveDateTime for simplicity
    pub medicine_amount: Option<i32>,
    pub medicine_per_times: f64,
    pub user_medicine_img_link: Option<Vec<String>>,
    pub medicine_unit: Option<String>,
    pub medicine_name: Option<String>,
    pub medicine_note: Option<String>,
}

// Define the overall response structure
#[derive(Serialize)]
pub struct GetMedicineResponse {
    pub medicines: Vec<UserMedicine>,
}

#[axum::debug_handler]
pub async fn get_medicine(
    Extension(db_pool): Extension<PgPool>,
    Json(payload): Json<GetMedicineRequest>,
) -> Result<Json<GetMedicineResponse>, (StatusCode, Json<ErrorResponse>)> {
    // 1. Find user_id from user_line_id
    let user_id_result = sqlx::query!(
        "SELECT user_id FROM users WHERE user_line_id = $1",
        payload.user_line_id
    )
    .fetch_optional(&db_pool)
    .await
    .map_err(|e| {
        eprintln!("Database error fetching user_id: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: "Error fetching user".to_string(),
            }),
        )
    })?;

    let user_id = match user_id_result {
        Some(user) => user.user_id,
        None => {
            return Err((
                StatusCode::NOT_FOUND,
                Json(ErrorResponse {
                    error: "User not found".to_string(),
                }),
            ));
        }
    };

    // 2. Build the query based on whether a date is provided
    let mut query = r#"
        SELECT user_medicine_id, user_id, medicine_schedule, medicine_amount, medicine_per_times, user_medicine_img_link, medicine_unit, medicine_name, medicine_note
        FROM user_medicines
        WHERE user_id = $1
    "#.to_string();
    let mut query_builder = sqlx::query_as::<_, UserMedicine>(&query);

    if let Some(date_str) = payload.date {
        // Parse the date string into a NaiveDateTime
        let date = NaiveDateTime::parse_from_str(&date_str, "%Y-%m-%dT%H:%M:%S").map_err(|e| {
            eprintln!("Error parsing date: {}", e);
            (
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse {
                    error: "Invalid date format. Use YYYY-MM-DDTHH:MM:SS".to_string(),
                }),
            )
        })?;
        // Add a condition to filter by date
        query.push_str(" AND medicine_schedule @> ARRAY[$2::timestamp]");
        query_builder = sqlx::query_as::<_, UserMedicine>(&query).bind(user_id).bind(date);
    } else {
        query_builder = sqlx::query_as::<_, UserMedicine>(&query).bind(user_id);
    }

    // 3. Fetch user medicines
    let medicines = query_builder
        .fetch_all(&db_pool)
        .await
        .map_err(|e| {
            eprintln!("Database error fetching user medicines: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: "Error fetching user medicines".to_string(),
                }),
            )
        })?;

    Ok(Json(GetMedicineResponse { medicines }))
}

// New struct for the request body
#[derive(Deserialize)]
pub struct TakeMedicineRequest {
    pub user_line_id: String,
    pub user_medicine_id: i32,
    pub user_take_medicine_time: String, // "YYYY-MM-DD" format
}

// New struct for the success response
#[derive(Serialize)]
pub struct TakeMedicineResponse {
    pub message: String,
}

// New struct for the request body
#[derive(Deserialize)]
pub struct GetTakeMedicineRequest {
    pub user_line_id: String,
    pub user_take_medicine_time: Option<String>, // "YYYY-MM-DD" format
}

// New struct for the response body
#[derive(Serialize, FromRow)]
pub struct GetTakeMedicineResponse {
    pub user_take_medicines_id: i32,
    pub user_id: i32,
    pub user_medicine_id: i32,
    pub user_take_medicine_time: NaiveDate,
}

#[axum::debug_handler]
pub async fn take_medicine(
    Extension(db_pool): Extension<PgPool>,
    Json(payload): Json<TakeMedicineRequest>,
) -> Result<Json<TakeMedicineResponse>, (StatusCode, Json<ErrorResponse>)> {
    // 1. Find user_id from user_line_id
    let user_id_result = sqlx::query!(
        "SELECT user_id FROM users WHERE user_line_id = $1",
        payload.user_line_id
    )
    .fetch_optional(&db_pool)
    .await
    .map_err(|e| {
        eprintln!("Database error fetching user_id: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: "Error fetching user".to_string(),
            }),
        )
    })?;

    let user_id = match user_id_result {
        Some(user) => user.user_id,
        None => {
            return Err((
                StatusCode::NOT_FOUND,
                Json(ErrorResponse {
                    error: "User not found".to_string(),
                }),
            ));
        }
    };

    // 2. Parse the date string
    let chrono_date = chrono::NaiveDate::parse_from_str(&payload.user_take_medicine_time, "%Y-%m-%d")
    .map_err(|e| {
        eprintln!("Error parsing date: {}", e);
        (
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: "Invalid date format. Use YYYY-MM-DD".to_string(),
            })
        )
    })?;

    // Convert chrono::NaiveDate to time::Date
    let take_medicine_date = time::Date::from_calendar_date(
        chrono_date.year(),
        time::Month::try_from(chrono_date.month() as u8).unwrap(),
        chrono_date.day() as u8
    ).map_err(|e| {
        eprintln!("Error converting date: {:?}", e);
        (
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: "Error converting date".to_string(),
            })
        )
    })?;


    // 3. Insert into user_take_medicines
    let insert_result = sqlx::query!(
        r#"
        INSERT INTO user_take_medicines (user_id, user_medicine_id, user_take_medicine_time)
        VALUES ($1, $2, $3)
        "#,
        user_id,
        payload.user_medicine_id,
        take_medicine_date
    )
    .execute(&db_pool)
    .await;

    match insert_result {
        Ok(_) => Ok(Json(TakeMedicineResponse {
            message: "Medicine taken record added successfully".to_string(),
        })),
        Err(e) => {
            eprintln!("Database error inserting medicine taken record: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: "Error adding medicine taken record".to_string(),
                })
            ))
        }
    }
}

// New struct for the request body
#[derive(Deserialize)]
pub struct EditMedicineRequest {
    pub medicine_name: Option<String>,
    pub medicine_amount: Option<i32>,
    pub medicine_per_times: Option<f32>,
    pub medicine_schedule: Option<Vec<String>>,
    pub medicine_note: Option<String>,
    pub medicine_unit: Option<String>,
    pub user_medicine_img_link: Option<Vec<String>>,
    pub user_line_id: String,
}

// #[axum::debug_handler]
// pub async fn edit_medicine(
//     Extension(db_pool): Extension<PgPool>,
//     Path(user_medicine_id): Path<i32>,
//     mut multipart: Multipart,
// ) -> Result<Json<Value>, (StatusCode, Json<ErrorResponse>)> {
//     let mut edit_medicine_request: EditMedicineRequest = EditMedicineRequest {
//         medicine_name: None,
//         medicine_amount: None,
//         medicine_per_times: None,
//         medicine_schedule: None,
//         medicine_note: None,
//         medicine_unit: None,
//         user_medicine_img_link: None,
//         user_line_id: String::new(),
//     };
//     let mut image_urls = Vec::new();

//     while let Some(field) = multipart.next_field().await.unwrap() {
//         match field.name() {
//             Some("image") => {
//                 let file_name = field.file_name().unwrap_or("image.jpg").to_string();
//                 let data = field.bytes().await.unwrap();

//                 if data.len() > MAX_IMAGE_SIZE {
//                     return Err((
//                         StatusCode::PAYLOAD_TOO_LARGE,
//                         Json(ErrorResponse {
//                             error: "Image size exceeds 30MB limit".to_string(),
//                         }),
//                     ));
//                 }

//                 if let Err(e) = ImageReader::new(Cursor::new(&data)).with_guessed_format() {
//                     return Err((
//                         StatusCode::BAD_REQUEST,
//                         Json(ErrorResponse {
//                             error: format!("Invalid file type: {}", e),
//                         }),
//                     ));
//                 }

//                 let image_data = data.to_vec();
//                 match upload_image_to_supabase(image_data, &file_name).await {
//                     Ok(urls) => image_urls.extend(urls),
//                     Err(e) => {
//                         return Err((
//                             StatusCode::INTERNAL_SERVER_ERROR,
//                             Json(ErrorResponse { error: e }),
//                         ))
//                     }
//                 }
//             }
//             Some("medicine_name") => edit_medicine_request.medicine_name = Some(field.text().await.unwrap()),
//             Some("medicine_amount") => {
//                 edit_medicine_request.medicine_amount = Some(field.text().await.unwrap().parse().unwrap_or(0))
//             }
//             Some("medicine_per_times") => {
//                 edit_medicine_request.medicine_per_times = Some(field.text().await.unwrap().parse().unwrap_or(0.0))
//             }
//             Some("medicine_schedule") => {
//                 edit_medicine_request.medicine_schedule =
//                     Some(serde_json::from_str(&field.text().await.unwrap()).unwrap_or_default())
//             }
//             Some("medicine_note") => edit_medicine_request.medicine_note = Some(field.text().await.unwrap()),
//             Some("medicine_unit") => edit_medicine_request.medicine_unit = Some(field.text().await.unwrap()),
//             Some("user_line_id") => edit_medicine_request.user_line_id = field.text().await.unwrap(),
//             _ => {}
//         }
//     }
//     if !image_urls.is_empty() {
//         edit_medicine_request.user_medicine_img_link = Some(image_urls);
//     }

//     let user_id = get_user_id_by_line_id(&db_pool, &edit_medicine_request.user_line_id)
//         .await
//         .map_err(|e| (StatusCode::BAD_REQUEST, Json(ErrorResponse { error: e })))?;

//     let mut updates = Vec::new();
//     let mut values: Vec<Value> = Vec::new();

//     if let Some(medicine_name) = edit_medicine_request.medicine_name {
//         updates.push("medicine_name = $".to_string() + &(values.len() + 1).to_string());
//         values.push(Value::String(medicine_name));
//     }
//     if let Some(medicine_amount) = edit_medicine_request.medicine_amount {
//         updates.push("medicine_amount = $".to_string() + &(values.len() + 1).to_string());
//         values.push(Value::from(medicine_amount));
//     }
//     if let Some(medicine_per_times) = edit_medicine_request.medicine_per_times {
//         updates.push("medicine_per_times = $".to_string() + &(values.len() + 1).to_string());
//         values.push(Value::from(medicine_per_times));
//     }
//     if let Some(medicine_schedule) = edit_medicine_request.medicine_schedule {
//         let parsed_schedule = parse_schedule_to_timestamps(medicine_schedule).map_err(|e| {
//             (
//                 StatusCode::BAD_REQUEST,
//                 Json(ErrorResponse {
//                     error: format!("Failed to parse schedule: {}", e),
//                 }),
//             )
//         })?;
//         updates.push("medicine_schedule = $".to_string() + &(values.len() + 1).to_string());
//         values.push(Value::Array(parsed_schedule.into_iter().map(Value::from).collect()));
//     }
//     if let Some(medicine_note) = edit_medicine_request.medicine_note {
//         updates.push("medicine_note = $".to_string() + &(values.len() + 1).to_string());
//         values.push(Value::String(medicine_note));
//     }
//     if let Some(medicine_unit) = edit_medicine_request.medicine_unit {
//         updates.push("medicine_unit = $".to_string() + &(values.len() + 1).to_string());
//         values.push(Value::String(medicine_unit));
//     }
//     if let Some(user_medicine_img_link) = edit_medicine_request.user_medicine_img_link {
//         updates.push("user_medicine_img_link = $".to_string() + &(values.len() + 1).to_string());
//         values.push(Value::Array(user_medicine_img_link.into_iter().map(Value::String).collect()));
//     }

//     if updates.is_empty() {
//         return Err((
//             StatusCode::BAD_REQUEST,
//             Json(ErrorResponse {
//                 error: "No fields to update".to_string(),
//             }),
//         ));
//     }

//     let mut query = "UPDATE user_medicines SET ".to_string();
//     query.push_str(&updates.join(", "));
//     query.push_str(" WHERE user_medicine_id = $");
//     query.push_str(&(values.len() + 1).to_string());
//     query.push_str(" AND user_id = $");
//     query.push_str(&(values.len() + 2).to_string());

//     values.push(Value::from(user_medicine_id));
//     values.push(Value::from(user_id));

//     let mut sqlx_query = sqlx::query(&query);
//     for value in values {
//         sqlx_query = match value {
//             Value::String(s) => sqlx_query.bind(s),
//             Value::Number(n) => {
//                 if let Some(i) = n.as_i64() {
//                     sqlx_query.bind(i)
//                 } else if let Some(f) = n.as_f64() {
//                     sqlx_query.bind(f)
//                 } else {
//                     sqlx_query
//                 }
//             },
//             Value::Array(arr) => {
//                 if let Some(first) = arr.first() {
//                     match first {
//                         Value::String(_) => {
//                             let string_vec: Vec<String> = arr.into_iter().map(|v| v.as_str().unwrap_or_default().to_string()).collect();
//                             sqlx_query.bind(string_vec)
//                         },
//                         _ => {
//                             let naive_date_time_vec: Vec<NaiveDateTime> = arr.into_iter().filter_map(|v| {
//                                 if let Value::String(s) = v {
//                                     NaiveDateTime::parse_from_str(s, "%Y-%m-%dT%H:%M:%S").ok()
//                                 } else {
//                                     None
//                                 }
//                             }).collect();
//                             sqlx_query.bind(naive_date_time_vec)
//                         }
//                     }
//                 } else {
//                     sqlx_query
//                 }
//             },
//             _ => sqlx_query,
//         };
//     }

//     let result = sqlx_query.execute(&db_pool).await.map_err(|e| {
//         (
//             StatusCode::INTERNAL_SERVER_ERROR,
//             Json(ErrorResponse {
//                 error: format!("Database error: {}", e),
//             }),
//         )
//     })?;

//     if result.rows_affected() == 0 {
//         return Err((
//             StatusCode::NOT_FOUND,
//             Json(ErrorResponse {
//                 error: "Medicine not found".to_string(),
//             }),
//         ));
//     }

//     Ok(Json(json!({ "message": "Medicine updated successfully" })))
// }