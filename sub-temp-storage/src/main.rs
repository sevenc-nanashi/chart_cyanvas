mod models;
mod result;
mod routes;

use axum::{
    routing::{get, post},
    Router,
};
use std::net::SocketAddr;
use tower_http::trace::{self, TraceLayer};
use tracing::{info, Level};

#[tokio::main]
async fn main() {
    let _ = dotenv::from_path("../.env");
    let _ = dotenv::dotenv();
    let app = Router::new()
        .route("/", get(routes::root_get))
        .route("/upload", post(routes::upload))
        .route(
            "/download/:id",
            get(routes::download_get).head(routes::download_head),
        )
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(trace::DefaultMakeSpan::new().level(Level::INFO))
                .on_response(trace::DefaultOnResponse::new().level(Level::INFO)),
        );

    tracing_subscriber::fmt().init();

    info!("Listening on port 3204");

    axum::Server::bind(&SocketAddr::from(([0, 0, 0, 0], 3204)))
        .serve(app.into_make_service())
        .await
        .unwrap();
}
