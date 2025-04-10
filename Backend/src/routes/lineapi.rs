use axum::{
    routing::post,
    Router,
    response::IntoResponse,
    Json,
};
use axum::http::StatusCode;
use reqwest::Client;
use serde::Deserialize;
use std::env;

#[derive(Deserialize)]
pub struct RichMenuPayload {
    user_id: String,
    richmenu_id: String,
}

pub async fn link_richmenu(
    Json(payload): Json<RichMenuPayload>,
) -> impl IntoResponse {
    let client = Client::new();

    let res = client.post(format!(
        "https://api.line.me/v2/bot/user/{}/richmenu/{}",
        payload.user_id, payload.richmenu_id
    ))
    .header(
        "Authorization",
        format!("Bearer {}", env::var("LINE_CHANNEL_ACCESS_TOKEN").expect("LINE_CHANNEL_ACCESS_TOKEN not set")),
    )
    .header("Content-Length", "0")
    .send()
    .await
    .unwrap();

    match res.status().is_success() {
        true => (StatusCode::OK, "Success").into_response(),
        false => {
            let error_message = res.text().await.unwrap_or_else(|_| "Failed to read error response".to_string());
            (StatusCode::BAD_REQUEST, format!("Failed: {}", error_message)).into_response()
        }
    }
}
