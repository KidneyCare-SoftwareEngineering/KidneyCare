use axum::{Extension, Json};
use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, Pool};
use serde::Serialize;
use std::sync::Arc;
use crate::schema::ingredients::dsl::*;

#[derive(Serialize, Queryable)]
pub struct Ingredient {
    pub ingredient_id: i32,
    pub ingredient_name: String,
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