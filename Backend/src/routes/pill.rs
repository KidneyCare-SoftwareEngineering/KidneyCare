use axum::{extract::Multipart, Extension, Json};
use chrono::{NaiveDateTime, ParseError};
use image::io::Reader as ImageReader;
use reqwest::{Client, StatusCode};
use serde::{Deserialize, Serialize};
use sqlx::postgres::PgPool;
use std::io::Cursor;
use std::time::Instant;

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

const MAX_IMAGE_SIZE: usize = 30 * 1024 * 1024;
const UPLOAD_URL: &str = "http://localhost:3000/image";

fn parse_schedule_to_timestamps(schedule: Vec<String>) -> Result<Vec<NaiveDateTime>, ParseError> {
    schedule
        .into_iter()
        .map(|s| {
            println!("Parsing schedule: {}", s);
            let parsed = NaiveDateTime::parse_from_str(&s, "%Y-%m-%dT%H:%M:%S")?;
            println!("Parsed schedule: {}", parsed);
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
    println!("Raw response body: {}", response_text);

    let upload_response: serde_json::Value = serde_json::from_str(&response_text)
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    let image_urls = upload_response["imageUrls"]
        .as_array()
        .ok_or_else(|| "Missing field `imageUrls` in response".to_string())?
        .iter()
        .map(|url| url.as_str().unwrap_or_default().to_string())
        .collect();

    println!("Supabase Upload Time: {:?}", start.elapsed());
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
    // let start = Instant::now();
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
