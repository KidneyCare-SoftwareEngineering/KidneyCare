use axum::{
    routing::{delete, get, patch, post},
    Extension, Router,
    http::{header::HeaderValue, Method, StatusCode},
};
use backend::routes::food::*;
use backend::routes::mealplan::*;
use backend::routes::user::*;
use backend::routes::pill::*;
use backend::routes::admin::*;
use backend::routes::chatbot::*;
use sqlx::postgres::PgPoolOptions;

use tower_http::cors::{Any, CorsLayer};
use tokio::net::TcpListener;
use backend::routes::recipe::*;
use backend::routes::ingredient::*;
use backend::routes::lineapi::*;

use std::env;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().expect("Failed to load .env file");

    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let server_address = format!("127.0.0.1:{}", port);
    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL is not set");

    let db_pool = PgPoolOptions::new()
        .max_connections(100)
        .connect(&database_url)
        .await
        .expect("Failed to connect to database");

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::PATCH])
        .allow_headers(Any);

    let listener = TcpListener::bind(&server_address)
        .await
        .expect("Failed to bind to address");

    println!("Listening on {}", listener.local_addr().unwrap());

    let app = Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .route("/food_details", get(get_food_details))
        .route("/food_cards", get(get_food_cards))
        .route("/food_details/{recipe_id}", get(get_food_detail))
        .route("/meal_plan", post(create_meal_plan))
        .route("/update_meal_plan", post(update_meal_plan))
        .route("/users", post(create_user))
        .route("/add_pill", post(handle_image_upload))
        .route("/get_pill_by_id", get(get_pill_by_user_line_id))
        .route("/admin_login", post(admin_login))
        .route("/chatbot/{user_id}", get(get_user_by_id))
        .route("/get_recipes", get(get_recipes))
        .route("/get_recipe", get(get_recipe))
        .route("/lineapi", post(link_richmenu))
        .route("/create_recipe", post(create_recipe))
        // .route("/update_recipe/{recipe_id}", patch(update_recipe))
        .route("/delete_recipe/{recipe_id}", delete(delete_recipe))
        .route("/ingredients", get(get_ingredients)) // Add this line
        .route("/create_ingredient", post(create_ingredient))
        .route("/update_ingredient/{ingredient_id}", patch(update_ingredient))
        .route("/delete_ingredient/{ingredient_id}", delete(delete_ingredient))
        .route("/get_medicine", post(get_medicine))
        .route("/get_meal_plan", post(get_meal_plan))
        .route("/take_medicine", post(take_medicine))
        // .route("/get_pills", get(get_pill_by_user_line_id)) // Change to GET and use query
        .layer(Extension(db_pool.clone()))
        .layer(cors);

    axum::serve(listener, app)
        .await
        .expect("Failed to start server");
}
