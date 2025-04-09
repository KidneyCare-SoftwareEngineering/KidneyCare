use axum::extract::Path;
use axum::{Extension, Json};
use axum::http::StatusCode;
use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, Pool};
use serde::{Serialize, Deserialize};
use std::sync::Arc;
use crate::schema::ingredients::dsl::*;
use serde_json::json;

#[derive(Serialize, Queryable)]
pub struct Ingredient {
    pub ingredient_id: i32,
    pub ingredient_name: String,
    pub ingredient_name_eng: Option<String>,
}

#[derive(Deserialize, Debug)]
pub struct CreateIngredientPayload {
    pub ingredient_name: String,
    pub ingredient_name_eng: Option<String>, // Optional field
}

#[derive(Deserialize, Debug)]
pub struct UpdateIngredientPayload {
    pub ingredient_name: Option<String>,
    pub ingredient_name_eng: Option<String>,
}

pub type DbPool = Pool<ConnectionManager<PgConnection>>;

pub async fn get_ingredients(
    Extension(db_pool): Extension<Arc<DbPool>>,
) -> Result<Json<Vec<Ingredient>>, axum::http::StatusCode> {
    let mut conn = db_pool.get().map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;
    let results = ingredients
        .select((ingredient_id, ingredient_name, ingredient_name_eng))
        .load::<Ingredient>(&mut conn)
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(results))
}

pub async fn create_ingredient(
    Extension(db_pool): Extension<Arc<DbPool>>,
    Json(payload): Json<CreateIngredientPayload>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let mut conn = db_pool.get().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let insert_result = diesel::insert_into(ingredients)
        .values((
            ingredient_name.eq(payload.ingredient_name.clone()),
            ingredient_name_eng.eq(payload.ingredient_name_eng.clone()),
        ))
        .execute(&mut conn);

    match insert_result {
        Ok(_) => {
            println!(
                "Created ingredient with name: {} and name_eng: {:?}",
                &payload.ingredient_name, &payload.ingredient_name_eng
            );
            Ok(Json(json!({
                "status": "success",
                "message": "Ingredient created successfully"
            })))
        }
        Err(diesel::result::Error::DatabaseError(diesel::result::DatabaseErrorKind::UniqueViolation, _)) => {
            eprintln!("Failed to insert ingredient: duplicate key value");
            Ok(Json(json!({
                "status": "error",
                "message": "Ingredient already exists"
            })))
        }
        Err(err) => {
            eprintln!("Failed to insert ingredient: {}", err);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

#[axum::debug_handler]
pub async fn update_ingredient(
    Extension(db_pool): Extension<Arc<DbPool>>,
    Path(ingredient_id_param): Path<i32>,
    Json(payload): Json<UpdateIngredientPayload>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let mut conn = db_pool.get().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    diesel::update(ingredients.filter(ingredient_id.eq(ingredient_id_param)))
        .set((
            payload.ingredient_name.as_ref().map(|name| ingredient_name.eq(name.clone())),
            payload.ingredient_name_eng.as_ref().map(|name_eng| ingredient_name_eng.eq(name_eng.clone())),
        ))
        .execute(&mut conn)
        .map_err(|err| {
            eprintln!("Failed to update ingredient: {}", err);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    println!("Updated ingredient with id: {}", ingredient_id_param);

    Ok(Json(json!({
        "status": "success",
        "message": "Ingredient updated successfully"
    })))
}

#[axum::debug_handler]
pub async fn delete_ingredient(
    Extension(db_pool): Extension<Arc<DbPool>>,
    Path(ingredient_id_param): Path<i32>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let mut conn = db_pool.get().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Cascading deletes are handled by the database schema (ON DELETE CASCADE)
    diesel::delete(ingredients.filter(ingredient_id.eq(ingredient_id_param)))
        .execute(&mut conn)
        .map_err(|err| {
            eprintln!("Failed to delete ingredient: {}", err);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    println!("Deleted ingredient with id: {}", ingredient_id_param);

    Ok(Json(json!({
        "status": "success",
        "message": "Ingredient deleted successfully"
    })))
}