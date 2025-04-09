use axum::{Extension, Json, extract::Path};
use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, Pool};
use serde::{Deserialize, Serialize};
use std::f64;
use std::sync::Arc;
use serde_json::json;
use crate::schema::{recipes, recipes_ingredients, recipes_nutrients};
use crate::schema::recipes::dsl::*;

#[derive(Deserialize)]
pub struct UpdateRecipe {
    pub recipe_name: Option<String>,
    pub recipe_method: Option<Vec<Option<String>>>,
    pub calories: Option<f64>,
    pub calories_unit: Option<String>,
    pub recipe_img_link: Option<Vec<Option<String>>>,
    pub food_category: Option<Vec<Option<String>>>,
    pub dish_type: Option<Vec<Option<String>>>,
}

#[derive(Serialize)]
pub struct RecipeDetailResponse {
    pub recipes: Vec<RecipeDetail>,
}

#[derive(Serialize)]
pub struct RecipeDetail {
    pub recipe_id: Option<i32>,
    pub recipe_name: Option<String>,
    pub recipe_method: Option<Vec<Option<String>>>,
    pub calories: Option<f64>,
    pub calories_unit: Option<String>,
    pub food_category: Option<Vec<Option<String>>>,
    pub dish_type: Option<Vec<Option<String>>>,
    pub ingredients: Vec<RecipeIngredient>,
    pub nutrients: Vec<RecipeNutrient>,
}

#[derive(Serialize, Queryable, Selectable)]
#[diesel(table_name = recipes)]
pub struct Recipe {
    pub recipe_id: i32,
    pub recipe_name: Option<String>,
    pub recipe_method: Option<Vec<Option<String>>>,
    pub calories: Option<f64>,
    pub calories_unit: Option<String>,
    pub recipe_img_link: Option<Vec<Option<String>>>,
    pub food_category: Option<Vec<Option<String>>>,
    pub dish_type: Option<Vec<Option<String>>>,
}

#[derive(Serialize, Queryable, Selectable)]
#[diesel(table_name = recipes_ingredients)]
pub struct RecipeIngredient {
    pub recipes_ingredients_id: i32, // Added to match schema
    pub recipe_id: i32,
    pub ingredient_id: i32,
    pub amount: i32,
    pub ingredient_unit: String,
}

#[derive(Serialize, Queryable, Selectable)]
#[diesel(table_name = recipes_nutrients)]
pub struct RecipeNutrient {
    pub recipe_nutrient_id: i32, // Added to match schema
    pub recipe_id: i32,
    pub nutrient_id: i32,
    pub quantity: f64,
}

pub type DbPool = Pool<ConnectionManager<PgConnection>>;

#[axum::debug_handler]
pub async fn update_recipe(
    Path(r_id): Path<i32>,
    Extension(db_pool): Extension<Arc<DbPool>>,
    Json(payload): Json<UpdateRecipe>,
) -> Result<Json<String>, Json<serde_json::Value>> {
    let mut conn = db_pool.get().map_err(|_| {
        Json(json!({ "error": "Failed to connect to the database" }))
    })?;

    let affected_rows = diesel::update(recipes.filter(recipe_id.eq(r_id)))
        .set((
            payload.recipe_name.map(|name| recipe_name.eq(name)),
            payload.recipe_method.map(|method| recipe_method.eq(method)),
            payload.calories.map(|calories_value| calories.eq(calories_value)),
            payload.calories_unit.map(|unit| calories_unit.eq(unit)),
            payload.recipe_img_link.map(|img_link| recipe_img_link.eq(img_link)),
            payload.food_category.map(|category| food_category.eq(category)),
            payload.dish_type.map(|dish| dish_type.eq(dish)),
        ))
        .execute(&mut conn)
        .map_err(|_| {
            Json(json!({ "error": "Failed to execute the update query" }))
        })?;

    if affected_rows == 0 {
        return Err(Json(json!({ "error": "Recipe not found" })));
    }

    Ok(Json("Recipe updated successfully".to_string()))
}

#[axum::debug_handler]
pub async fn delete_recipe(
    Path(r_id): Path<i32>,
    Extension(db_pool): Extension<Arc<DbPool>>,
) -> Result<Json<String>, Json<serde_json::Value>> {
    let mut conn = db_pool.get().map_err(|_| {
        Json(json!({ "error": "Failed to connect to the database" }))
    })?;

    let affected_rows = diesel::delete(recipes.filter(recipe_id.eq(r_id)))
        .execute(&mut conn)
        .map_err(|_| {
            Json(json!({ "error": "Failed to execute the delete query" }))
        })?;

    if affected_rows == 0 {
        return Err(Json(json!({ "error": "Recipe not found" })));
    }

    Ok(Json("Recipe deleted successfully".to_string()))
}