use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use tracing::error;

use crate::models::ErrorResponse;

#[derive(Debug)]
pub struct AppError(anyhow::Error);
pub type Result<T> = std::result::Result<T, AppError>;

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        error!("Error: {:?}", self.0);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ErrorResponse {
                code: "error".to_string(),
                message: self.0.to_string(),
            }),
        )
            .into_response()
    }
}

impl<E> From<E> for AppError
where
    E: Into<anyhow::Error>,
{
    fn from(err: E) -> Self {
        Self(err.into())
    }
}
