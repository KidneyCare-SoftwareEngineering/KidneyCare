let mut nutrition_map = NutritionLimit {
    calories: 0.0,
    carbs: 0.0,
    fat: 0.0,
    phosphorus: 0.0,
    potassium: 0.0,
    protein: 0.0,
    sodium: 0.0,
};

for limit in nutrition_limit {
    match limit.nutrient_id {
        Some(1) => nutrition_map.calories = limit.nutrient_limit.unwrap_or(0.0) as f32,
        Some(2) => nutrition_map.carbs = limit.nutrient_limit.unwrap_or(0.0) as f32,
        Some(3) => nutrition_map.fat = limit.nutrient_limit.unwrap_or(0.0) as f32,
        Some(4) => nutrition_map.phosphorus = limit.nutrient_limit.unwrap_or(0.0) as f32,
        Some(5) => nutrition_map.potassium = limit.nutrient_limit.unwrap_or(0.0) as f32,
        Some(6) => nutrition_map.protein = limit.nutrient_limit.unwrap_or(0.0) as f32,
        Some(7) => nutrition_map.sodium = limit.nutrient_limit.unwrap_or(0.0) as f32,
        _ => (),
    }
}