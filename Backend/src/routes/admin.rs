// src/routes/admin.rs

use axum::{
    http::StatusCode,
    Extension, Json,
    response::IntoResponse,
    routing::post,
    Router,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use md5::{Md5, Digest};
use std::collections::HashMap;

#[derive(Deserialize)]
pub struct AdminLoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Serialize)]
pub struct AdminLoginResponse {
    pub success: bool,
    pub message: String,
}

#[derive(Serialize)]
pub struct ErrorResponse {
    pub error: String,
}

pub async fn admin_login(
    Extension(db_pool): Extension<PgPool>,
    Json(payload): Json<AdminLoginRequest>,
) -> Result<Json<AdminLoginResponse>, (StatusCode, Json<ErrorResponse>)> {
    // 1. Hash the provided password using MD5
    let mut hasher = Md5::new();
    hasher.update(payload.password.as_bytes());
    let hashed_password = format!("{:x}", hasher.finalize());

    // 2. Fetch the admin from the database
    let admin = sqlx::query!(
        "SELECT admin_password FROM admins WHERE admin_email = $1",
        payload.email
    )
    .fetch_optional(&db_pool)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: format!("Database error: {}", e),
            }),
        )
    })?;

    // 3. Check if admin exists
    match admin {
        Some(admin) => {
            // Remove hyphens from the database password
            let db_password = admin.admin_password.to_string().replace("-", "");
            // Print the database password and the hashed password
            println!("Database password: {}", db_password);
            println!("Hashed password: {}", hashed_password);

            // 4. Check if the password matches
            if db_password == hashed_password {
                Ok(Json(AdminLoginResponse {
                    success: true,
                    message: "Login successful".to_string(),
                }))
            } else {
                Err((
                    StatusCode::UNAUTHORIZED,
                    Json(ErrorResponse {
                        error: "Incorrect password".to_string(),
                    }),
                ))
            }
        }
        None => Err((
            StatusCode::UNAUTHORIZED,
            Json(ErrorResponse {
                error: "Admin not found".to_string(),
            }),
        )),
    }
}
