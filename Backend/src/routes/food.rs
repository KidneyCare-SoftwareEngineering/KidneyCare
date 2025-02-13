use axum::extract::Path;
use axum::{
    extract::State, http::StatusCode, Json
};
use sqlx::PgPool;
use crate::models::food::{FoodDetail, FoodCard};
use crate::db::queries::{fetch_food_cards, fetch_food_details, get_food_detail_by_id};

pub async fn get_food_details(
    State(pg_pool): State<PgPool>,
) -> Result<Json<Vec<FoodDetail>>, (StatusCode, String)> {
    match fetch_food_details(&pg_pool).await {
        Ok(rows) => Ok(Json(rows)),
        Err(_) => Err((StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch food details".to_string())),
    }
}

pub async fn get_food_cards(
    State(pg_pool): State<PgPool>,
) -> Result<Json<Vec<FoodCard>>, (StatusCode, String)> {
    match fetch_food_cards(&pg_pool).await {
        Ok(rows) => Ok(Json(rows)),
        Err(_) => Err((StatusCode::INTERNAL_SERVER_ERROR, "Failed to fetch food cards".to_string())),
    }
}

pub async fn get_food_detail(
    State(pg_pool): State<PgPool>,
    Path(recipe_id): Path<i32>,
) -> Result<Json<FoodDetail>, (StatusCode, String)> {
    let food_detail = get_food_detail_by_id(&pg_pool, recipe_id).await?;

    Ok(Json(food_detail))
}
