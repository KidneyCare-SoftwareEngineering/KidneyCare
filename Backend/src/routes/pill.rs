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
    #[serde(rename = "imageUrl")]
    image_url: String,
}

#[derive(Deserialize, Serialize)]
pub struct ErrorResponse {
    error: String,
}

const MAX_IMAGE_SIZE: usize = 30 * 1024 * 1024;
const UPLOAD_URL: &str = "http://localhost:3000/image";

pub async fn upload_image_to_supabase(image_data: Vec<u8>, file_name: &str) -> Result<String, String> {
    let start = Instant::now();
    let client = Client::new();
    let form = reqwest::multipart::Form::new()
        .part("image", reqwest::multipart::Part::bytes(image_data).file_name(file_name.to_string()));

    let response = client.post(UPLOAD_URL)
        .multipart(form)
        .send()
        .await
        .map_err(|e| format!("Failed to send request: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("Supabase upload failed with status: {}", response.status()));
    }

    let upload_response = response.json::<UploadResponse>().await
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    println!("Supabase Upload Time: {:?}", start.elapsed());
    Ok(upload_response.image_url)
}

#[axum::debug_handler]
pub async fn handle_image_upload(mut multipart: Multipart) -> Result<Json<UploadResponse>, (StatusCode, Json<ErrorResponse>)> {
    let start = Instant::now();
    let mut image_data = Vec::new();
    let mut file_name = String::new();

    while let Some(field) = multipart.next_field().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse { error: format!("Failed to read multipart field: {}", e) }),
        )
    })? {
        if let Some("image") = field.name() {
            file_name = field.file_name().unwrap_or("image.jpg").to_string();
            let data = field.bytes().await.map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ErrorResponse { error: format!("Failed to read file data: {}", e) }),
                )
            })?;

            if data.len() > MAX_IMAGE_SIZE {
                return Err((
                    StatusCode::PAYLOAD_TOO_LARGE,
                    Json(ErrorResponse { error: "Image size exceeds 30MB limit".to_string() }),
                ));
            }

            // let optimize_start = Instant::now();
            // image_data = optimize_image(data.to_vec()).map_err(|e| {
            //     (
            //         StatusCode::INTERNAL_SERVER_ERROR,
            //         Json(ErrorResponse { error: format!("Image processing failed: {}", e) }),
            //     )
            // })?;
            // println!("Image Optimization Time: {:?}", optimize_start.elapsed());
            image_data = data.to_vec();
        }
    }

    if image_data.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse { error: "No image uploaded".to_string() }),
        ));
    }

    match upload_image_to_supabase(image_data, &file_name).await {
        Ok(image_url) => {
            println!("Total Upload Time: {:?}", start.elapsed());
            Ok(Json(UploadResponse { image_url }))
        },
        Err(e) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse { error: format!("Image upload failed: {}", e) }),
        )),
    }
}

// fn optimize_image(data: Vec<u8>) -> Result<Vec<u8>, image::ImageError> {
//     let start = Instant::now();
//     let img = ImageReader::new(Cursor::new(data))
//         .with_guessed_format()?
//         .decode()?;

//     let img = match img {
//         DynamicImage::ImageRgba8(img) => DynamicImage::ImageRgb8(rgba8_to_rgb8(img)),
//         _ => img,
//     };

//     let resized = img.resize(1024, 1024, image::imageops::FilterType::Nearest);

//     let jpeg_start = Instant::now();
//     let output = encode_jpeg_fast(&resized)?;
//     println!("JPEG Encoding Time: {:?}", jpeg_start.elapsed());

//     println!("Total Image Processing Time: {:?}", start.elapsed());
//     Ok(output)
// }

// fn rgba8_to_rgb8(input: image::ImageBuffer<Rgba<u8>, Vec<u8>>) -> image::ImageBuffer<Rgb<u8>, Vec<u8>> {
//     let width = input.width();
//     let height = input.height();
//     let input_raw = input.into_raw();

//     let output_data: Vec<u8> = input_raw.par_chunks(4)
//         .flat_map(|chunk| chunk[..3].to_vec())
//         .collect();

//     image::ImageBuffer::from_raw(width, height, output_data).unwrap()
// }

// fn encode_jpeg_fast(img: &DynamicImage) -> Result<Vec<u8>, image::ImageError> {
//     let mut comp = Compress::new(ColorSpace::JCS_RGB);
//     comp.set_quality(75.0);
//     let mut output = Vec::new();
//     comp.compress_to_mem(&img.to_rgb8(), &mut output)?;
//     Ok(output)
// }
