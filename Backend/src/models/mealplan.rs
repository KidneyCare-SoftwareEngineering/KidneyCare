use serde::Deserialize;

#[derive(Deserialize)]
pub struct MealPlanRequest {
    pub data: UserMealRequest,
}

#[derive(Deserialize)]
pub struct UserMealRequest {
    pub u_id: String,
    pub days: u32,
}