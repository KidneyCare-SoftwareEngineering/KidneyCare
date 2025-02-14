use serde::de::Error;
use serde::{Deserialize, Deserializer};
use time::{format_description::well_known::Iso8601, PrimitiveDateTime};

#[derive(Deserialize)]
pub struct CreateUser {
    pub user_line_id: Option<String>,
    pub name: String,
    #[serde(deserialize_with = "deserialize_datetime")]
    pub birthdate: PrimitiveDateTime,
    pub weight: f64,
    pub height: f64,
    pub profile_img_link: Option<String>,
    pub gender: Option<String>,
    pub kidney_level: Option<i32>,
    pub kidney_dialysis: Option<bool>,
    pub users_food_condition: Option<Vec<i32>>,
    pub user_disease: Option<Vec<i32>>,
    pub users_ingredient_allergies: Option<Vec<i32>>,
}

pub fn deserialize_datetime<'de, D>(deserializer: D) -> Result<PrimitiveDateTime, D::Error>
where
    D: Deserializer<'de>,
{
    let date_str: String = Deserialize::deserialize(deserializer)?;
    PrimitiveDateTime::parse(&date_str, &Iso8601::DEFAULT).map_err(D::Error::custom)
}
