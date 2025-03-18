use crate::models::food::{FoodDetail, FoodCard};
use sqlx::{PgPool, Transaction};
use crate::models::user::CreateUser;
use axum::http::StatusCode;

pub async fn fetch_food_details(pg_pool: &PgPool) -> Result<Vec<FoodDetail>, sqlx::Error> {
    let rows = sqlx::query_as!(FoodDetail, "SELECT 
        r.recipe_id AS id,
        r.recipe_name,
        r.calories,
        r.recipe_img_link AS image_url,
        COALESCE(
            json_agg(
                json_build_object(
                    'ingredient_amount', ri.amount,
                    'ingredient_name', i.ingredient_name,
                    'ingredient_unit', ri.ingredient_unit
                )
            ) FILTER (WHERE i.ingredient_id IS NOT NULL), '[]'::json
        ) AS ingredient,
        r.recipe_method,
        COALESCE((SELECT SUM(rn.quantity) FROM recipes_nutrients rn
            JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
            WHERE rn.recipe_id = r.recipe_id AND n.name = 'protein'), 0) AS protein,
        COALESCE((SELECT SUM(rn.quantity) FROM recipes_nutrients rn
            JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
            WHERE rn.recipe_id = r.recipe_id AND n.name = 'carbs'), 0) AS carbs,
        COALESCE((SELECT SUM(rn.quantity) FROM recipes_nutrients rn
            JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
            WHERE rn.recipe_id = r.recipe_id AND n.name = 'fat'), 0) AS fat,
        COALESCE((SELECT SUM(rn.quantity) FROM recipes_nutrients rn
            JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
            WHERE rn.recipe_id = r.recipe_id AND n.name = 'sodium'), 0) AS sodium,
        COALESCE((SELECT SUM(rn.quantity) FROM recipes_nutrients rn
            JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
            WHERE rn.recipe_id = r.recipe_id AND n.name = 'phosphorus'), 0) AS phosphorus,
        COALESCE((SELECT SUM(rn.quantity) FROM recipes_nutrients rn
            JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
            WHERE rn.recipe_id = r.recipe_id AND n.name = 'potassium'), 0) AS potassium
    FROM recipes r
    LEFT JOIN recipes_ingredients ri ON r.recipe_id = ri.recipe_id
    LEFT JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
    GROUP BY r.recipe_id;")
    .fetch_all(pg_pool)
    .await?;

    Ok(rows)
}

pub async fn get_food_detail_by_id(
    pg_pool: &PgPool,
    recipe_id: i32,
) -> Result<FoodDetail, (StatusCode, String)> {
    let row = sqlx::query_as!(FoodDetail, "SELECT 
        r.recipe_id AS id,
        r.recipe_name,
        r.calories,
        r.recipe_img_link AS image_url,
        COALESCE(
            json_agg(
                json_build_object(
                    'ingredient_amount', ri.amount,
                    'ingredient_name', i.ingredient_name,
                    'ingredient_unit', ri.ingredient_unit
                )
            ) FILTER (WHERE i.ingredient_id IS NOT NULL), '[]'::json
        ) AS ingredient,
        r.recipe_method, -- Assuming recipe_method is stored as TEXT[]
        COALESCE((SELECT SUM(rn.quantity) 
            FROM recipes_nutrients rn
            JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
            WHERE rn.recipe_id = r.recipe_id AND n.name = 'protein'
        ), 0) AS protein,
        COALESCE((SELECT SUM(rn.quantity) 
            FROM recipes_nutrients rn
            JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
            WHERE rn.recipe_id = r.recipe_id AND n.name = 'carbs'
        ), 0) AS carbs,
        COALESCE((SELECT SUM(rn.quantity) 
            FROM recipes_nutrients rn
            JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
            WHERE rn.recipe_id = r.recipe_id AND n.name = 'fat'
        ), 0) AS fat,
        COALESCE((SELECT SUM(rn.quantity) 
            FROM recipes_nutrients rn
            JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
            WHERE rn.recipe_id = r.recipe_id AND n.name = 'sodium'
        ), 0) AS sodium,
        COALESCE((SELECT SUM(rn.quantity) 
            FROM recipes_nutrients rn
            JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
            WHERE rn.recipe_id = r.recipe_id AND n.name = 'phosphorus'
        ), 0) AS phosphorus,
        COALESCE((SELECT SUM(rn.quantity) 
            FROM recipes_nutrients rn
            JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
            WHERE rn.recipe_id = r.recipe_id AND n.name = 'potassium'
        ), 0) AS potassium
    FROM 
        recipes r
    LEFT JOIN 
        recipes_ingredients ri ON r.recipe_id = ri.recipe_id
    LEFT JOIN 
        ingredients i ON ri.ingredient_id = i.ingredient_id
    WHERE 
        r.recipe_id = $1
    GROUP BY
        r.recipe_id;", recipe_id)
        .fetch_optional(pg_pool)
        .await
        .map_err(|_e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to fetch food detail".to_string(),
            )
        })?;

    match row {
        Some(recipe) => Ok(recipe),
        None => Err((StatusCode::NOT_FOUND, "Recipe not found".to_string())),
    }
}

pub async fn fetch_food_cards(pg_pool: &PgPool) -> Result<Vec<FoodCard>, sqlx::Error> {
    let rows = sqlx::query_as!(FoodCard, "SELECT 
        r.recipe_id AS id,
        r.recipe_name,
        r.calories,
        r.recipe_img_link AS image_url,
        r.food_category,
        r.dish_type,
        COALESCE(array_agg(i.ingredient_name) FILTER (WHERE i.ingredient_name IS NOT NULL), ARRAY[]::VARCHAR[]) AS ingredients,
        COALESCE(array_agg(i.ingredient_name_eng) FILTER (WHERE i.ingredient_name_eng IS NOT NULL), ARRAY[]::VARCHAR[]) AS ingredients_eng,
        COALESCE((SELECT SUM(rn.quantity) FROM recipes_nutrients rn
            JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
            WHERE rn.recipe_id = r.recipe_id AND n.name = 'protein'), 0) AS protein,
        COALESCE((SELECT SUM(rn.quantity) FROM recipes_nutrients rn
            JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
            WHERE rn.recipe_id = r.recipe_id AND n.name = 'carbs'), 0) AS carbs,
        COALESCE((SELECT SUM(rn.quantity) FROM recipes_nutrients rn
            JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
            WHERE rn.recipe_id = r.recipe_id AND n.name = 'fat'), 0) AS fat,
        COALESCE((SELECT SUM(rn.quantity) FROM recipes_nutrients rn
            JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
            WHERE rn.recipe_id = r.recipe_id AND n.name = 'sodium'), 0) AS sodium,
        COALESCE((SELECT SUM(rn.quantity) FROM recipes_nutrients rn
            JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
            WHERE rn.recipe_id = r.recipe_id AND n.name = 'phosphorus'), 0) AS phosphorus,
        COALESCE((SELECT SUM(rn.quantity) FROM recipes_nutrients rn
            JOIN nutrients n ON rn.nutrient_id = n.nutrient_id
            WHERE rn.recipe_id = r.recipe_id AND n.name = 'potassium'), 0) AS potassium
    FROM recipes r
    LEFT JOIN recipes_ingredients ri ON r.recipe_id = ri.recipe_id
    LEFT JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
    GROUP BY r.recipe_id;")
    .fetch_all(pg_pool)
    .await?;

    Ok(rows)
}

pub async fn insert_user(
    payload: &CreateUser,
    tx: &mut Transaction<'_, sqlx::Postgres>,
) -> Result<i32, (StatusCode, String)> {
    let user_result = sqlx::query!(
        "INSERT INTO users (user_line_id, name, birthdate, weight, height, profile_img_link, gender, kidney_level, kidney_dialysis)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING user_id",
        payload.user_line_id,
        payload.name,
        payload.birthdate,
        payload.weight,
        payload.height,
        payload.profile_img_link,
        payload.gender,
        payload.kidney_level,
        payload.kidney_dialysis
    )
    .fetch_one(&mut **tx)
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to insert user".to_string()))?;
    
    Ok(user_result.user_id)
}

pub async fn insert_nutrient_limits(
    user_id: i32,
    weight: f32,
    age: i32,
    kidney_level: i32,
    kidney_dialysis: bool,
    tx: &mut Transaction<'_, sqlx::Postgres>,
) -> Result<(), (StatusCode, String)> {
    let (protein_factor, energy_factor) = match kidney_level {
        1 => (0.9, 35.0),
        2 => (0.75, 35.0),
        3 => (0.48, 35.0),
        4 => (0.23, 35.0),
        5 => (0.10, 35.0),
        _ => return Err((StatusCode::BAD_REQUEST, "Invalid kidney level".to_string())),
    };

    let protein = if kidney_dialysis {
        weight * 1.2
    } else if kidney_level >= 3 {
        weight * 0.6
    } else {
        weight * protein_factor
    };

    let energy = if age >= 60 {
        weight * 30.0
    } else {
        weight * 35.0
    };

    let nutrient_limits = vec![
        (1, protein),
        (2, -1.0),
        (3, -1.0),
        (4, 2000.0),
        (5, 900.0),
        (6, 2500.0),
        (7, energy)
    ];

    for (nutrient_id, limit) in nutrient_limits {
        sqlx::query!(
            "INSERT INTO users_nutrients_limit_per_day (user_id, nutrient_id, nutrient_limit) VALUES ($1, $2, $3)",
            user_id,
            nutrient_id,
            limit as f64
        )
        .execute(&mut **tx)
        .await
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to insert nutrient limits".to_string()))?;
    }

    Ok(())
}

pub async fn insert_user_relations(
    user_id: i32,
    payload: &CreateUser,
    tx: &mut Transaction<'_, sqlx::Postgres>,
) -> Result<(), (StatusCode, String)> {
    if let Some(food_conditions) = &payload.users_food_condition {
        for &food_condition_id in food_conditions {
            sqlx::query!(
                "INSERT INTO users_food_condition_types (user_id, food_condition_type_id) VALUES ($1, $2)",
                user_id, food_condition_id
            )
            .execute(&mut **tx)
            .await
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to insert food condition".to_string()))?;
        }
    }

    if let Some(diseases) = &payload.user_disease {
        for &disease_id in diseases {
            sqlx::query!(
                "INSERT INTO users_diseases (user_id, disease_id) VALUES ($1, $2)",
                user_id,
                disease_id
            )
            .execute(&mut **tx)
            .await
            .map_err(|_| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Failed to insert disease".to_string(),
                )
            })?;
        }
    }

    if let Some(ingredient_allergies) = &payload.users_ingredient_allergies {
        for &allergy_id in ingredient_allergies {
            sqlx::query!(
                "INSERT INTO users_ingredient_allergies (user_id, ingredient_allergy_id) VALUES ($1, $2)",
                user_id, allergy_id
            )
            .execute(&mut **tx)
            .await
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Failed to insert ingredient allergies".to_string()))?;
        }
    }

    Ok(())
}