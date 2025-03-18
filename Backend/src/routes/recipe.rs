// src/routes/recipe.rs

use axum::{
    extract::{Multipart, Query, Path},
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    Extension, Json, Router,
};
use image::io::Reader as ImageReader;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sqlx::{FromRow, PgPool, Row};
use std::collections::HashMap;
use std::io::Cursor;
use std::sync::Arc;

#[derive(Deserialize)]
pub struct RecipeQuery {
    pub recipe_name: Option<String>,
}

#[derive(Serialize, FromRow)]
pub struct Recipe {
    pub recipe_name: String,
    pub recipe_img_link: Vec<String>,
}

#[derive(Serialize)]
pub struct RecipeResponse {
    pub recipes: Vec<Recipe>,
}

#[derive(Serialize)]
pub struct ErrorResponse {
    pub error: String,
}

#[derive(Serialize, Debug, Default, Clone, Deserialize)]
pub struct RecipeIngredient {
    pub ingredient_id: i32,
    #[serde(skip_serializing)]
    pub ingredient_name: Option<String>,
    pub amount: i32,
    pub ingredient_unit: String,
}

// Represents a nutrient associated with a recipe
#[derive(Serialize, Debug, Default, Clone, Deserialize)]
pub struct RecipeNutrient {
    pub nutrient_id: i32,
    pub name: Option<String>,
    pub quantity: f64,
    pub unit: Option<String>,
}

// Represents a recipe with its ingredients and nutrients
#[derive(Serialize, Debug, Default, Deserialize)]
pub struct RecipeDetail {
    pub recipe_id: Option<i32>,
    pub recipe_name: String,
    pub recipe_method: Vec<String>,
    pub calories: f64,
    pub calories_unit: String,
    pub food_category: Vec<String>,
    pub dish_type: Option<Vec<String>>,
    pub ingredients: Vec<RecipeIngredient>,
    pub nutrients: Vec<RecipeNutrient>,
}

#[derive(Serialize)]
pub struct RecipeDetailResponse {
    pub recipes: Vec<RecipeDetail>,
}

const MAX_IMAGE_SIZE: usize = 30 * 1024 * 1024;
const UPLOAD_URL: &str = "http://localhost:3000/image";

pub async fn get_recipes(
    Extension(db_pool): Extension<PgPool>,
    Query(params): Query<RecipeQuery>,
) -> Result<Json<RecipeResponse>, (StatusCode, Json<ErrorResponse>)> {
    let mut query = "SELECT recipe_name, recipe_img_link FROM recipes".to_string();
    let mut conditions = Vec::new();

    if let Some(recipe_name) = params.recipe_name {
        conditions.push(format!("recipe_name ILIKE '%{}%'", recipe_name));
    }

    if !conditions.is_empty() {
        query.push_str(" WHERE ");
        query.push_str(&conditions.join(" AND "));
    }

    let recipes = sqlx::query_as::<_, Recipe>(&query)
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

    Ok(Json(RecipeResponse { recipes }))
}

pub async fn get_recipe(
    Extension(db_pool): Extension<PgPool>,
    Query(params): Query<RecipeQuery>,
) -> Result<Json<RecipeDetailResponse>, (StatusCode, Json<ErrorResponse>)> {
    let mut query = r#"
        SELECT
            recipes.recipe_id,
            recipes.recipe_name,
            recipes.recipe_method,
            recipes.calories,
            recipes.calories_unit,
            recipes.recipe_img_link,
            recipes.food_category,
            recipes.dish_type,
            ingredients.ingredient_id,
            ingredients.ingredient_name,
            recipes_ingredients.amount,
            recipes_ingredients.ingredient_unit,
            nutrients.nutrient_id,
            nutrients.name as nutrient_name,
            recipes_nutrients.quantity,
            nutrients.unit
        FROM
            recipes
        INNER JOIN
            recipes_ingredients ON recipes.recipe_id = recipes_ingredients.recipe_id
        INNER JOIN
            ingredients ON recipes_ingredients.ingredient_id = ingredients.ingredient_id
        INNER JOIN
            recipes_nutrients ON recipes.recipe_id = recipes_nutrients.recipe_id
        INNER JOIN
            nutrients ON recipes_nutrients.nutrient_id = nutrients.nutrient_id
    "#.to_string();

    let mut conditions = Vec::new();

    if let Some(recipe_name) = params.recipe_name {
        conditions.push(format!("recipes.recipe_name ILIKE '%{}%'", recipe_name));
    }

    if !conditions.is_empty() {
        query.push_str(" WHERE ");
        query.push_str(&conditions.join(" AND "));
    }

    let rows = sqlx::query(&query)
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

    let mut recipes_map: HashMap<i32, RecipeDetail> = HashMap::new();

    for row in rows {
        let recipe_id: i32 = row.get("recipe_id");
        let recipe = recipes_map.entry(recipe_id).or_insert_with(|| {
            RecipeDetail {
                recipe_id: Some(row.get("recipe_id")),
                recipe_name: row.get("recipe_name"),
                recipe_method: row.get("recipe_method"),
                calories: row.get("calories"),
                calories_unit: row.get("calories_unit"),
                food_category: row.get("food_category"),
                dish_type: row.get("dish_type"),
                ingredients: Vec::new(),
                nutrients: Vec::new(),
            }
        });

        let ingredient_id: i32 = row.get("ingredient_id");
        let ingredient = RecipeIngredient {
            ingredient_id: ingredient_id,
            ingredient_name: Some(row.get("ingredient_name")),
            amount: row.get("amount"),
            ingredient_unit: row.get("ingredient_unit"),
        };
        let mut ingredient_map: HashMap<i32, RecipeIngredient> = HashMap::new();
        for item in &recipe.ingredients {
          ingredient_map.insert(item.ingredient_id, (*item).clone());
        }
        ingredient_map.entry(ingredient_id).or_insert(ingredient.clone());
        recipe.ingredients = ingredient_map.into_values().collect();

        let nutrient_id: i32 = row.get("nutrient_id");
        let nutrient = RecipeNutrient {
            nutrient_id: nutrient_id,
            name: Some(row.get("nutrient_name")),
            quantity: row.get("quantity"),
            unit: Some(row.get("unit")),
        };
        let mut nutrient_map: HashMap<i32, RecipeNutrient> = HashMap::new();
        for item in &recipe.nutrients {
          nutrient_map.insert(item.nutrient_id, (*item).clone());
        }
        nutrient_map.entry(nutrient_id).or_insert(nutrient.clone());
        recipe.nutrients = nutrient_map.into_values().collect();
    }

    let recipes: Vec<RecipeDetail> = recipes_map.into_values().collect();

    Ok(Json(RecipeDetailResponse { recipes }))
}

pub async fn upload_image_to_supabase(
    image_data: Vec<u8>,
    file_name: &str,
) -> Result<Vec<String>, String> {
    let client = Client::new();
    let form = reqwest::multipart::Form::new().part(
        "image",
        reqwest::multipart::Part::bytes(image_data).file_name(file_name.to_string()),
    );

    let response = client
        .post(UPLOAD_URL)
        .multipart(form)
        .send()
        .await
        .map_err(|e| format!("Failed to send request: {}", e))?;

    if !response.status().is_success() {
        return Err(format!(
            "Supabase upload failed with status: {}",
            response.status()
        ));
    }

    let response_text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response text: {}", e))?;

    let upload_response: serde_json::Value = serde_json::from_str(&response_text)
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    let image_urls = upload_response["imageUrls"]
        .as_array()
        .ok_or_else(|| "Missing field `imageUrls` in response".to_string())?
        .iter()
        .map(|url| url.as_str().unwrap_or_default().to_string())
        .collect();

    Ok(image_urls)
}
pub async fn create_recipe(
    Extension(db_pool): Extension<PgPool>,
    mut multipart: Multipart,
) -> Result<Json<Value>, (StatusCode, Json<ErrorResponse>)> {
    let mut recipe_name = String::new();
    let mut recipe_method = Vec::new();
    let mut calories = 0.0;
    let mut calories_unit = String::new();
    let mut food_category = Vec::new();
    let mut dish_type = Vec::new();
    let mut ingredients: Vec<RecipeIngredient> = Vec::new();
    let mut nutrients: Vec<RecipeNutrient> = Vec::new();
    let mut image_urls = Vec::new();

    while let Some(field) = multipart.next_field().await.unwrap() {
        match field.name() {
            Some("image") => {
                let file_name = field.file_name().unwrap_or("image.jpg").to_string();
                let data = field.bytes().await.unwrap();

                if data.len() > MAX_IMAGE_SIZE {
                    return Err((
                        StatusCode::PAYLOAD_TOO_LARGE,
                        Json(ErrorResponse {
                            error: "Image size exceeds 30MB limit".to_string(),
                        }),
                    ));
                }

                if let Err(e) = ImageReader::new(Cursor::new(&data)).with_guessed_format() {
                    return Err((
                        StatusCode::BAD_REQUEST,
                        Json(ErrorResponse {
                            error: format!("Invalid file type: {}", e),
                        }),
                    ));
                }

                let image_data = data.to_vec();
                match upload_image_to_supabase(image_data, &file_name).await {
                    Ok(urls) => image_urls.extend(urls),
                    Err(e) => {
                        return Err((
                            StatusCode::INTERNAL_SERVER_ERROR,
                            Json(ErrorResponse { error: e }),
                        ))
                    }
                }
            }
            Some("recipe_name") => recipe_name = field.text().await.unwrap(),
            Some("recipe_method") => {
                recipe_method =
                    serde_json::from_str(&field.text().await.unwrap()).unwrap_or_default()
            }
            Some("calories") => calories = field.text().await.unwrap().parse().unwrap_or(0.0),
            Some("calories_unit") => calories_unit = field.text().await.unwrap(),
            Some("food_category") => {
                food_category =
                    serde_json::from_str(&field.text().await.unwrap()).unwrap_or_default()
            }
            Some("dish_type") => {
                dish_type = serde_json::from_str(&field.text().await.unwrap()).unwrap_or_default()
            }
            Some("ingredients") => {
                ingredients = serde_json::from_str(&field.text().await.unwrap()).unwrap_or_default()
            }
            Some("nutrients") => {
                let nutris: Vec<HashMap<String, Value>> =
                    serde_json::from_str(&field.text().await.unwrap()).unwrap_or_default();
                for nutri in nutris {
                    let id = nutri
                        .get("nutrient_id")
                        .and_then(|v| v.as_i64())
                        .map(|v| v as i32)
                        .unwrap_or_else(|| {
                            eprintln!("Warning: Missing or invalid 'nutrient_id'");
                            0
                        });

                    if id == 0 {
                        return Err((StatusCode::BAD_REQUEST, Json(ErrorResponse { error: "Invalid nutrient_id: nutrient_id cannot be 0".to_string() })));
                    }

                    // Check if the nutrient_id exists in the nutrients table
                    let nutrient_exists = sqlx::query("SELECT 1 FROM nutrients WHERE nutrient_id = $1")
                        .bind(id)
                        .fetch_optional(&db_pool)
                        .await
                        .map_err(|e| {
                            (
                                StatusCode::INTERNAL_SERVER_ERROR,
                                Json(ErrorResponse {
                                    error: format!("Database error checking nutrient: {}", e),
                                }),
                            )
                        })?
                        .is_some();

                    if !nutrient_exists {
                        return Err((
                            StatusCode::BAD_REQUEST,
                            Json(ErrorResponse {
                                error: format!("Invalid nutrient_id: {} does not exist in nutrients table", id),
                            }),
                        ));
                    }

                    let quantity = nutri
                        .get("quantity")
                        .and_then(|v| v.as_f64())
                        .unwrap_or(0.0);
                    let name = nutri
                        .get("name")
                        .and_then(|v| v.as_str())
                        .map(|s| s.to_string());
                    let unit = nutri
                        .get("unit")
                        .and_then(|v| v.as_str())
                        .map(|s| s.to_string());
                    nutrients.push(RecipeNutrient {
                        nutrient_id: id,
                        quantity,
                        name,
                        unit,
                    });
                }
            }
            _ => {}
        }
    }

    // Insert into recipes table
    let insert_result = sqlx::query!(
        r#"
        INSERT INTO recipes (recipe_name, recipe_method, calories, calories_unit, recipe_img_link, food_category, dish_type)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING recipe_id
        "#,
        recipe_name,
        &recipe_method,
        calories,
        calories_unit,
        &image_urls,
        &food_category,
        &dish_type
    )
    .fetch_one(&db_pool)
    .await;

    // Log the insert attempt
    println!("Attempting to insert into recipes: name={}, method={:?}, calories={}, unit={}, image_urls={:?}, categories={:?}, dish_types={:?}", 
                recipe_name, recipe_method, calories, calories_unit, image_urls, food_category, dish_type);

    let recipe_id = match insert_result {
        Ok(row) => {
            // Log success
            println!(
                "Successfully inserted into recipes with recipe_id: {}",
                row.recipe_id
            );
            row.recipe_id
        }
        Err(e) => {
            // Log error
            eprintln!("Database error inserting into recipes: {}", e);
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: format!("Database error inserting into recipes: {}", e),
                }),
            ));
        }
    };

    // Insert into recipes_ingredients table
    for ingredient in &ingredients {
        let ingredient_insert_result = sqlx::query!(
            r#"
            INSERT INTO recipes_ingredients (recipe_id, ingredient_id, amount, ingredient_unit)
            VALUES ($1, $2, $3, $4)
            "#,
            recipe_id,
            ingredient.ingredient_id,
            ingredient.amount,
            ingredient.ingredient_unit
        )
        .execute(&db_pool)
        .await;

        match ingredient_insert_result {
            Ok(_) => {
                println!("Successfully inserted ingredient: {:?}", ingredient);
            }
            Err(e) => {
                eprintln!(
                    "Database error inserting ingredient {:?}: {}",
                    ingredient, e
                );
                return Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ErrorResponse {
                        error: format!("Database error inserting ingredient: {}", e),
                    }),
                ));
            }
        }
    }

    // Insert into recipes_nutrients table
    for nutrient in &nutrients {
        println!("Inserting nutrient: {:?}", nutrient); // Log the nutrient being inserted
        let nutrient_insert_result = sqlx::query!(
            r#"
            INSERT INTO recipes_nutrients (recipe_id, nutrient_id, quantity)
            VALUES ($1, $2, $3)
            "#,
            recipe_id,
            nutrient.nutrient_id,
            nutrient.quantity
        )
        .execute(&db_pool)
        .await;

        match nutrient_insert_result {
            Ok(_) => {
                println!("Successfully inserted nutrient: {:?}", nutrient);
            }
            Err(e) => {
                eprintln!("Database error inserting nutrient {:?}: {}", nutrient, e);
                return Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ErrorResponse {
                        error: format!("Database error inserting nutrient: {}", e),
                    }),
                ));
            }
        }
    }

    Ok(Json(
        json!({ "message": "Recipe created successfully", "recipe_id": recipe_id }),
    ))
}

#[axum::debug_handler]
pub async fn update_recipe(
    Extension(db_pool): Extension<PgPool>,
    Path(recipe_id): Path<i32>,
    headers: HeaderMap,
    mut multipart: Multipart, //change this
) -> Result<Json<Value>, (StatusCode, Json<ErrorResponse>)> {
    let mut payload: RecipeDetail = Default::default();

    let mut image_urls = Vec::new();

    if let Some(header) = headers.get("image") {
        if let Ok(image_urls_string) = header.to_str() {
            let parsed_urls: Result<Vec<String>, _> = serde_json::from_str(image_urls_string);
            match parsed_urls {
                Ok(urls) => {
                    image_urls = urls;
                }
                Err(e) => {
                    eprintln!("Error parsing image_urls: {:?}", e);
                }
            }
        }
    }
    while let Some(field) = multipart.next_field().await.unwrap() {
        match field.name() {
            Some("recipe_detail") => {
                payload = serde_json::from_str(&field.text().await.unwrap()).unwrap_or_default()
            }
            _ => {}
        }
    }

    let recipe_name = &payload.recipe_name;
    let recipe_method = payload.recipe_method.clone();
    let calories = payload.calories;
    let calories_unit = payload.calories_unit.clone();
    let food_category = &payload.food_category;
    let dish_type = payload.dish_type.clone().unwrap_or_default();
    let ingredients: Vec<RecipeIngredient> = payload.ingredients.clone();
    let nutrients: Vec<RecipeNutrient> = payload.nutrients.clone();

    // Start a transaction
    let mut tx = db_pool.begin().await.map_err(|e| {
        eprintln!("Failed to begin transaction: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: "Failed to begin database transaction".to_string(),
            }),
        )
    })?;

    // Initialize the SQL query
    let mut query = "UPDATE recipes SET".to_string();
    let mut values = Vec::new();
    let mut params: Vec<String> = Vec::new();

    // Update the query to check for Option types correctly
    if !recipe_name.is_empty() {
        query.push_str(" recipe_name = $1,");
        values.push(payload.recipe_name.clone());
    }
    if !payload.recipe_method.is_empty() {
        query.push_str(" recipe_method = $2,");
        values.push(serde_json::to_string(&recipe_method).unwrap());
    }
    if let Some(cal) = Some(payload.calories) {
        query.push_str(" calories = $3,");
        values.push(cal.to_string());
    }
    if !calories_unit.is_empty() {
        query.push_str(" calories_unit = $4,"); 
        values.push(payload.calories_unit);
    }
    if !image_urls.is_empty() {
        query.push_str(" recipe_img_link = $5,");
        values.push(serde_json::to_string(&image_urls).unwrap()); // Correctly serialize Vec<String>
    }
    if !food_category.is_empty() {
        query.push_str(" food_category = $6,");
        values.push(serde_json::to_string(&payload.food_category).unwrap()); // Correctly serialize Vec<String>
    }
    if let Some(dish) = Some(payload.dish_type.clone()) {
        query.push_str(" dish_type = $7,");
        values.push(serde_json::to_string(&dish).unwrap_or_default());
    }

    // Remove the last comma (if any)
    if query.ends_with(',') {
        query.pop();
    }

    // Add the WHERE clause for the recipe_id
    query.push_str(" WHERE recipe_id = $8");

    // Execute the query with dynamic parameters
    let mut query_builder = sqlx::query(&query);
    for value in values {
        query_builder = query_builder.bind(value);
    }
    let update_result = query_builder.bind(recipe_id).execute(&mut *tx)
        .await;

    match update_result {
        Ok(_) => {
            println!("Successfully updated recipe with recipe_id: {}", recipe_id);
        }
        Err(e) => {
            eprintln!("Database error updating recipe: {}", e);
            tx.rollback().await.map_err(|e| {
                eprintln!("Failed to rollback transaction: {}", e);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ErrorResponse {
                        error: "Failed to rollback database transaction".to_string(),
                    }),
                )
            })?;
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: format!("Database error updating recipe: {}", e),
                }),
            ));
        }
    };

    // Update the recipes table
    let recipes_update_result = sqlx::query!(
        r#"
        UPDATE recipes SET recipe_name = $1, recipe_method = $2, calories = $3, calories_unit = $4, recipe_img_link = $5, food_category = $6, dish_type = $7
        WHERE recipe_id = $8
        "#,
        recipe_name,
        &recipe_method,
        calories,
        calories_unit,
        &image_urls,
        &food_category,
        &dish_type,
        recipe_id
    )
    .execute(&mut *tx)
    .await;
    match recipes_update_result {
        Ok(_) => {
            // Log success
            println!(
                "Successfully update into recipes with recipe_id: {}",
                recipe_id
            );
        }
        Err(e) => {
            // Log error
            eprintln!("Database error update into recipes: {}", e);
            tx.rollback().await.map_err(|e| {
                eprintln!("Failed to rollback transaction: {}", e);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ErrorResponse {
                        error: "Failed to rollback database transaction".to_string(),
                    }),
                )
            })?;
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: format!("Database error update into recipes: {}", e),
                }),
            ));
        }
    };

    // Delete existing ingredients and nutrients for this recipe
    let recipes_ingredients_delete_result = sqlx::query!(
        r#"DELETE FROM recipes_ingredients WHERE recipe_id = $1"#,
        recipe_id
    )
    .execute(&mut *tx)
    .await;
    match recipes_ingredients_delete_result {
        Ok(_) => {
            // Log success
            println!(
                "Successfully delete ingredients with recipe_id: {}",
                recipe_id
            );
        }
        Err(e) => {
            // Log error
            eprintln!("Database error delete ingredients: {}", e);
            tx.rollback().await.map_err(|e| {
                eprintln!("Failed to rollback transaction: {}", e);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ErrorResponse {
                        error: "Failed to rollback database transaction".to_string(),
                    }),
                )
            })?;
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: format!("Database error delete ingredients: {}", e),
                }),
            ));
        }
    };
    let recipes_nutrients_delete_result = sqlx::query!(
        r#"DELETE FROM recipes_nutrients WHERE recipe_id = $1"#,
        recipe_id
    )
    .execute(&mut *tx)
    .await;
    match recipes_nutrients_delete_result {
        Ok(_) => {
            // Log success
            println!(
                "Successfully delete nutrients with recipe_id: {}",
                recipe_id
            );
        }
        Err(e) => {
            // Log error
            eprintln!("Database error delete nutrients: {}", e);
            tx.rollback().await.map_err(|e| {
                eprintln!("Failed to rollback transaction: {}", e);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ErrorResponse {
                        error: "Failed to rollback database transaction".to_string(),
                    }),
                )
            })?;
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: format!("Database error delete nutrients: {}", e),
                }),
            ));
        }
    };
    // Re-insert the ingredients
    for ingredient in &ingredients {
        // Use payload.ingredients
        let ingredient_insert_result = sqlx::query(
            r#"
            INSERT INTO recipes_ingredients (recipe_id, ingredient_id, amount, ingredient_unit)
            VALUES ($1, $2, $3, $4)
            "#,
        )
        .bind(recipe_id)
        .bind(ingredient.ingredient_id)
        .bind(ingredient.amount)
        .bind(&ingredient.ingredient_unit)
        .execute(&mut *tx)
        .await;
        match ingredient_insert_result {
            Ok(_) => {
                println!("Successfully re-inserted ingredient: {:?}", ingredient);
            }
            Err(e) => {
                eprintln!(
                    "Database error re-inserting ingredient {:?}: {}",
                    ingredient, e
                );
                tx.rollback().await.map_err(|e| {
                    eprintln!("Failed to rollback transaction: {}", e);
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(ErrorResponse {
                            error: "Failed to rollback database transaction".to_string(),
                        }),
                    )
                })?;
                return Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ErrorResponse {
                        error: format!("Database error re-inserting ingredient: {}", e),
                    }),
                ));
            }
        }
    }
    // Re-insert the nutrients
    for nutrient in &nutrients {
        // use payload.nutrients
        let nutrient_insert_result = sqlx::query(
            r#"
            INSERT INTO recipes_nutrients (recipe_id, nutrient_id, quantity)
            VALUES ($1, $2, $3)
            "#,
        )
        .bind(recipe_id)
        .bind(nutrient.nutrient_id)
        .bind(nutrient.quantity)
        .execute(&mut *tx)
        .await;
        match nutrient_insert_result {
            Ok(_) => {
                println!("Successfully re-inserted nutrient: {:?}", nutrient);
            }
            Err(e) => {
                eprintln!("Database error re-inserting nutrient {:?}: {}", nutrient, e);
                tx.rollback().await.map_err(|e| {
                    eprintln!("Failed to rollback transaction: {}", e);
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(ErrorResponse {
                            error: "Failed to rollback database transaction".to_string(),
                        }),
                    )
                })?;
                return Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ErrorResponse {
                        error: format!("Database error re-inserting nutrient: {}", e),
                    }),
                ));
            }
        }
    }

    // Commit the transaction
    tx.commit().await.map_err(|e| {
        eprintln!("Failed to commit transaction: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: "Failed to commit database transaction".to_string(),
            }),
        )
    })?;

    Ok(Json(
        json!({ "message": "Recipe updated successfully", "recipe_id": recipe_id }),
    ))
}

// ... (other struct)
#[axum::debug_handler]
pub async fn delete_recipe(
    Extension(db_pool): Extension<PgPool>,
    Path(recipe_id): Path<i32>,
) -> Result<Json<Value>, (StatusCode, Json<ErrorResponse>)> {
    // Start a transaction
    let mut tx = db_pool.begin().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: format!("Database error: {}", e),
            }),
        )
    })?;

    // Delete from recipes table (this will cascade)
    let result = sqlx::query!("DELETE FROM recipes WHERE recipe_id = $1", recipe_id)
        .execute(&mut *tx)
        .await;
    match result {
        Ok(_) => {
            println!("Successfully deleted recipe with recipe_id: {}", recipe_id);
        }
        Err(e) => {
            eprintln!("Database error deleting recipe: {}", e);
            tx.rollback().await.map_err(|e| {
                eprintln!("Failed to rollback transaction: {}", e);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ErrorResponse {
                        error: "Failed to rollback database transaction".to_string(),
                    }),
                )
            })?;
            return Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: format!("Database error deleting recipe: {}", e),
                }),
            ));
        }
    };
   
    // Commit the transaction
    tx.commit().await.map_err(|e| {
        eprintln!("Failed to commit transaction: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                error: "Failed to commit database transaction".to_string(),
            }),
        )
    })?;

    Ok(Json(json!({
        "message": format!("Recipe with id {} and related data deleted successfully", recipe_id),
    })))
}
