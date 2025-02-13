use axum::{
    routing::{get, post},
    Router,
};
use sqlx::postgres::PgPoolOptions;
use tokio::net::TcpListener;
use Backend::routes::food::*;
use Backend::routes::mealplan::*;
use Backend::routes::user::*;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().expect("Failed to load .env file");

    let server_address = std::env::var("SERVER_ADDRESS").unwrap_or("127.0.0.1:3000".to_owned());
    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL is not set");

    let db_pool = PgPoolOptions::new()
        .max_connections(16)
        .connect(&database_url)
        .await
        .expect("Failed to connect to database");

    let listener = TcpListener::bind(server_address)
        .await
        .expect("Failed to bind to address");
    println!("Listening on {}", listener.local_addr().unwrap());

    let app = Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .route("/food_details", get(get_food_details))
        .route("/food_cards", get(get_food_cards))
        .route("/get_limit", get(get_limit))
        .route("/food_details/:recipe_id", get(get_food_detail))
        .route("/meal_plan", post(get_meal_plan))
        .route("/users", post(create_user))
        .with_state(db_pool);

    axum::serve(listener, app)
        .await
        .expect("Failed to start server");
}