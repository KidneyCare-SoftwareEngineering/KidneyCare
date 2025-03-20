use axum::{
    extract::Path,
    routing::get,
    Router,
    Extension,
    Json,
    http::StatusCode,
};
use serde::{Serialize, Deserialize};
use sqlx::{FromRow, PgPool};
use chrono::NaiveDate; 


#[derive(Serialize, Deserialize, Debug, FromRow)]
pub struct UserData {
    name: String,
    gender: String,
    weight: f64,
    height: f64,
    kidney_level: i32,
}


pub async fn get_user_by_id(
    Extension(pg_pool): Extension<PgPool>,
    Path(user_id): Path<String>, 
) -> Result<Json<UserData>, (StatusCode, String)> {
    match fetch_user_data_by_id(&pg_pool, &user_id).await {
        Ok(user_data) => Ok(Json(user_data)),
        Err(_) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to fetch user data".to_string(),
        )),
    }
}


pub async fn fetch_user_data_by_id(pool: &PgPool, user_id: &str) -> Result<UserData, sqlx::Error> {
    match sqlx::query_as::<_, UserData>( 
        "SELECT 
            name, 
            gender,
            weight,
            height,
            kidney_level
            FROM users WHERE user_line_id = $1"
    )
    .bind(user_id)
    .fetch_one(pool)
    .await 
    {
        Ok(user) => Ok(user),
        Err(e) => {
            eprintln!("Database error: {:?}", e);
            Err(e)
        }
    }
}