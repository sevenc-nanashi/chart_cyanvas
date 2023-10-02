mod models;
mod result;
mod routes;

use axum::{
    routing::{get, post},
    Router,
};
use std::{env, net::SocketAddr};
use tower_http::trace::{self, TraceLayer};
use tracing::{info, Level};

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/", get(routes::root_get))
        .route("/convert", post(routes::convert_post))
        .route("/download/{id}", get(routes::download_get))
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(trace::DefaultMakeSpan::new().level(Level::INFO))
                .on_response(trace::DefaultOnResponse::new().level(Level::INFO)),
        );

    let port = env::var("PORT").unwrap_or_else(|_| "3203".to_string());

    tracing_subscriber::fmt().init();

    info!("Listening on port {}", port);

    axum::Server::bind(&SocketAddr::from(([127, 0, 0, 1], port.parse().unwrap())))
        .serve(app.into_make_service())
        .await
        .unwrap();
}
