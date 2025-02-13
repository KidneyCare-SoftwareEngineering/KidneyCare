use std::env;
use dotenvy::dotenv;

pub struct Config {
    pub database_url: String,
}

impl Config {
    pub fn new() -> Self {
        dotenv().ok();
        let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
        Config { database_url }
    }
}
