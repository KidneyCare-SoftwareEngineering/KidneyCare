// src/routes/ingredient.rs

use axum::{
    extract::{Path, Query, Multipart},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post, patch, delete},
    Extension, Json, Router,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use std::collections::HashMap;
use sqlx::FromRow;
use serde_json::{json, Value};

#[derive(Deserialize)]
pub struct IngredientQuery {
    pub ingredient_name: Option<String>,
}

#[derive(Serialize, FromRow)]
pub struct Ingredient {
    pub ingredient_id: i32,
    pub ingredient_name: String,
    pub ingredient_name_eng: Option<String>,
}

#[derive(Serialize)]
pub struct IngredientResponse {
    pub ingredients: Vec<Ingredient>,
}

#[derive(Deserialize, Debug, Default)]
pub struct CreateIngredient {
    pub ingredient_name: String,
    pub ingredient_name_eng: Option<String>,
}

#[derive(Deserialize, Debug, Default)]
pub struct UpdateIngredient {
    pub ingredient_name: String,
}

#[derive(Serialize)]
pub struct ErrorResponse {
    pub error: String,
}

pub async fn get_ingredients(
    Extension(db_pool): Extension<PgPool>,
    Query(params): Query<IngredientQuery>,
) -> Result<Json<IngredientResponse>, (StatusCode, Json<ErrorResponse>)> {
    let mut query = "SELECT ingredient_id, ingredient_name, ingredient_name_eng FROM ingredients".to_string();
    let mut conditions = Vec::new();

    if let Some(ingredient_name) = params.ingredient_name {
        conditions.push(format!("ingredient_name ILIKE '%{}%'", ingredient_name));
    }

    if !conditions.is_empty() {
        query.push_str(" WHERE ");
        query.push_str(&conditions.join(" AND "));
    }
    let ingredients = sqlx::query_as::<_, Ingredient>(&query)
        .fetch_all(&db_pool)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: format!("Database error: {}", e),
                }),
            )
        })?;

    Ok(Json(IngredientResponse { ingredients }))
}

pub async fn create_ingredient(
    Extension(db_pool): Extension<PgPool>,
    Json(payload): Json<CreateIngredient>,
) -> Result<Json<Value>, (StatusCode, Json<ErrorResponse>)> {
    let result = sqlx::query!(
        r#"
        INSERT INTO ingredients (ingredient_name, ingredient_name_eng)
        VALUES ($1, $2)
        RETURNING ingredient_id
        "#,
        payload.ingredient_name,
        payload.ingredient_name_eng
    )
    .fetch_one(&db_pool)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: format!("Database error inserting ingredient: {}", e),
            }),
        )
    })?;

    Ok(Json(json!({ "message": "Ingredient created successfully", "ingredient_id": result.ingredient_id })))
}

#[axum::debug_handler]
pub async fn update_ingredient(
    Extension(db_pool): Extension<PgPool>,
    Path(ingredient_id): Path<i32>,
    Json(payload): Json<UpdateIngredient>,
) -> Result<Json<Value>, (StatusCode, Json<ErrorResponse>)> {
    let result = sqlx::query!(
        r#"
        UPDATE ingredients SET ingredient_name = $1
        WHERE ingredient_id = $2
        "#,
        payload.ingredient_name,
        ingredient_id
    )
    .execute(&db_pool)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: format!("Database error updating ingredient: {}", e),
            }),
        )
    })?;

    if result.rows_affected() == 0 {
        return Err((
            StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                error: "Ingredient not found".to_string(),
            }),
        ));
    }

    Ok(Json(json!({ "message": "Ingredient updated successfully" })))
}

pub async fn delete_ingredient(
    Extension(db_pool): Extension<PgPool>,
    Path(ingredient_id): Path<i32>,
) -> Result<Json<Value>, (StatusCode, Json<ErrorResponse>)> {
    let result = sqlx::query!(
        r#"
        DELETE FROM ingredients
        WHERE ingredient_id = $1
        "#,
        ingredient_id
    )
    .execute(&db_pool)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: format!("Database error deleting ingredient: {}", e),
            }),
        )
    })?;

    if result.rows_affected() == 0 {
        return Err((
            StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                error: "Ingredient not found".to_string(),
            }),
        ));
    }

    Ok(Json(json!({ "message": "Ingredient deleted successfully" })))
}
