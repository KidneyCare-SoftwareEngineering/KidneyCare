use std::{fs::File, io::BufReader};

use axum::{
    http::StatusCode, Json,
};
use serde_json::Value;
use crate::models::mealplan::MealPlanRequest;
pub async fn get_meal_plan(
    Json(payload): Json<MealPlanRequest>,
) -> Result<Json<Value>, (StatusCode, String)> {
    let file = File::open("src/mockup_data/meal_plan.json").map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to open meal plan file".to_string(),
        )
    })?;

    let reader = BufReader::new(file);

    let data: Value = serde_json::from_reader(reader).map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to read meal plan file".to_string(),
        )
    })?;

    Ok(Json(data))
}

pub async fn get_limit() -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    let file = File::open("src/mockup_data/data_to_ai.json").map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to open data file".to_string(),
        )
    })?;
    let reader = BufReader::new(file);
    let data: serde_json::Value = serde_json::from_reader(reader).map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to read data file".to_string(),
        )
    })?;

    Ok(Json(data))
}