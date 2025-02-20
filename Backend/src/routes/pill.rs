use axum::{Json, extract::Multipart};
use reqwest::{Client, StatusCode};
use serde::{Deserialize, Serialize};
use image::io::Reader as ImageReader;
use image::DynamicImage;
use std::io::Cursor;
use image::{Rgb, Rgba};
use std::time::Instant;
// use rayon::prelude::*;
// use mozjpeg::{Compress, ColorSpace};

#[derive(Deserialize, Serialize)]
pub struct UploadResponse {
    #[serde(rename = "imageUrls")]
    image_urls: Vec<String>,
}

#[derive(Deserialize, Serialize)]
pub struct ErrorResponse {
    error: String,
}

const MAX_IMAGE_SIZE: usize = 30 * 1024 * 1024;
const UPLOAD_URL: &str = "http://localhost:3000/image";

pub async fn upload_image_to_supabase(image_data: Vec<u8>, file_name: &str) -> Result<Vec<String>, String> {
    let start = Instant::now();
    let client = Client::new();
    let form = reqwest::multipart::Form::new()
        .part("image", reqwest::multipart::Part::bytes(image_data).file_name(file_name.to_string()));

    let response = client.post(UPLOAD_URL)
        .multipart(form)
        .send()
        .await
        .map_err(|e| {
            let error_message = format!("Failed to send request: {}", e);
            println!("{}", error_message);
            error_message
        })?;

    if !response.status().is_success() {
        let error_message = format!("Supabase upload failed with status: {}", response.status());
        println!("{}", error_message);
        return Err(error_message);
    }

    let response_text = response.text().await.map_err(|e| {
        let error_message = format!("Failed to read response text: {}", e);
        println!("{}", error_message);
        error_message
    })?;
    println!("Raw response body: {}", response_text);

    let upload_response = serde_json::from_str::<UploadResponse>(&response_text).map_err(|e| {
        let error_message = format!("Failed to parse response: {}", e);
        println!("{}", error_message);
        error_message
    })?;

    println!("Supabase Upload Time: {:?}", start.elapsed());
    Ok(upload_response.image_urls)
}

#[axum::debug_handler]
pub async fn handle_image_upload(mut multipart: Multipart) -> Result<Json<UploadResponse>, (StatusCode, Json<ErrorResponse>)> {
    let start = Instant::now();
    let mut image_urls = Vec::new();

    while let Some(field) = multipart.next_field().await.map_err(|e| {
        let error_message = format!("Failed to read multipart field: {}", e);
        println!("{}", error_message);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse { error: error_message }),
        )
    })? {
        if let Some("image") = field.name() {
            let file_name = field.file_name().unwrap_or("image.jpg").to_string();
            let data = field.bytes().await.map_err(|e| {
                let error_message = format!("Failed to read file data: {}", e);
                println!("{}", error_message);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ErrorResponse { error: error_message }),
                )
            })?;

            if data.len() > MAX_IMAGE_SIZE {
                let error_message = "Image size exceeds 30MB limit".to_string();
                println!("{}", error_message);
                return Err((
                    StatusCode::PAYLOAD_TOO_LARGE,
                    Json(ErrorResponse { error: error_message }),
                ));
            }

            let image_data = data.to_vec();

            match upload_image_to_supabase(image_data, &file_name).await {
                Ok(urls) => {
                    image_urls.extend(urls);
                },
                Err(e) => {
                    println!("{}", e);
                    return Err((
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(ErrorResponse { error: e }),
                    ));
                },
            }
        }
    }

    if image_urls.is_empty() {
        let error_message = "No images uploaded".to_string();
        println!("{}", error_message);
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse { error: error_message }),
        ));
    }

    println!("Total Upload Time: {:?}", start.elapsed());
    Ok(Json(UploadResponse { image_urls }))
}
