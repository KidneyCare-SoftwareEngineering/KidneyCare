use axum::{
    routing::{get, post},
    Router,
    Extension,
};
use sqlx::postgres::PgPoolOptions;
use tokio::net::TcpListener;
use Backend::routes::mealplan::*;
use Backend::routes::user::*; // Adjust this as needed

#[tokio::main]
async fn main() {
    dotenvy::dotenv().expect("Failed to load .env file");

    // Get the server address from environment variables or use the default one
    let server_address = std::env::var("SERVER_ADDRESS").unwrap_or_else(|_| "127.0.0.1:3000".to_owned());
    // Get the database URL from environment variables
    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL is not set");

    // Create the database connection pool
    let db_pool = PgPoolOptions::new()
        .max_connections(16)
        .connect(&database_url)
        .await
        .expect("Failed to connect to database");

    // Bind the server to the specified address
    let listener = TcpListener::bind(&server_address).await.unwrap_or_else(|_| {
        tokio::runtime::Handle::current().block_on(TcpListener::bind("127.0.0.1:3000"))
            .expect("Failed to bind to default address")
    });
    println!("Listening on {}", listener.local_addr().unwrap());

    // Create the Axum app and define routes
    let app = Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .route("/meal_plan", post(create_meal_plan)) // Your meal plan handler
        // Define other routes like food_details, user creation, etc.
        // .route("/food_details", get(get_food_details))
        // .route("/food_cards", get(get_food_cards))
        .layer(Extension(db_pool)); // Directly pass the db_pool here

    // Start the server using the TcpListener
    axum::serve(listener, app)
        .await
        .expect("Failed to start server");
}
