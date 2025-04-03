use axum::{
    routing::{delete, get, patch, post},
    Extension, Router,
};
use backend::routes::food::*;
use backend::routes::mealplan::*;
use backend::routes::user::*;
use backend::routes::pill::*;
use backend::routes::admin::*;
use sqlx::postgres::PgPoolOptions;
use tokio::net::TcpListener;
use backend::routes::recipe::*;
use backend::routes::ingredient::*;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().expect("Failed to load .env file");

    let server_address =
        std::env::var("SERVER_ADDRESS").unwrap_or_else(|_| "127.0.0.1:3000".to_owned());
    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL is not set");

    let db_pool = PgPoolOptions::new()
        .max_connections(16)
        .connect(&database_url)
        .await
        .expect("Failed to connect to database");

    let listener = TcpListener::bind(&server_address)
        .await
        .unwrap_or_else(|_| {
            tokio::runtime::Handle::current()
                .block_on(TcpListener::bind("127.0.0.1:3000"))
                .expect("Failed to bind to default address")
        });
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
        .route("/get_recipes", get(get_recipes))
        .route("/get_recipe", get(get_recipe))
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
        .layer(Extension(db_pool.clone()));

    axum::serve(listener, app)
        .await
        .expect("Failed to start server");
}
