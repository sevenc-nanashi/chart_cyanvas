use crate::models::{RootResponse, UploadResponse};
use std::io::Write;
use std::{collections::HashMap, sync::Arc};

use axum::response::IntoResponse;
use axum::{body::HttpBody, extract::Path, Json};
use tempfile::NamedTempFile;
use tokio::sync::Mutex;
use tracing::{info, warn};

use crate::result::Result;

static FILES: std::sync::LazyLock<Arc<Mutex<HashMap<String, NamedTempFile>>>> =
    std::sync::LazyLock::new(|| Arc::new(Mutex::new(HashMap::new())));

pub async fn root_get() -> Json<RootResponse> {
    Json(RootResponse {
        code: "ok".to_string(),
    })
}

pub async fn upload(
    mut request: axum::http::Request<axum::body::Body>,
) -> Result<Json<UploadResponse>> {
    info!("Upload request received");

    let mut file = NamedTempFile::new()?;
    while let Some(chunk) = request.data().await {
        let chunk = chunk?;
        if !chunk.is_empty() {
            file.write_all(&chunk)?;
        }
    }

    let id = uuid::Uuid::new_v4().to_string();
    FILES.lock().await.insert(id.clone(), file);

    Ok(Json(UploadResponse {
        code: "ok".to_string(),
        url: format!(
            "{}/download/{}",
            std::env::var("HOSTS_SUB_TEMP_STORAGE").expect("HOSTS_SUB_TEMP_STORAGE must be set"),
            id
        ),
    }))
}

pub async fn download_head(Path(id): Path<String>) -> Result<impl IntoResponse> {
    info!("Download HEAD: {}", id);
    let files = FILES.lock().await;
    if files.contains_key(&id) {
        Ok(axum::http::StatusCode::OK)
    } else {
        warn!("Not found: {}", id);
        Ok(axum::http::StatusCode::NOT_FOUND)
    }
}

pub async fn download_get(Path(id): Path<String>) -> Result<impl IntoResponse> {
    info!("Download: {}", id);
    let mut files = FILES.lock().await;
    let Some(file) = files.remove(&id) else {
        warn!("Not found: {}", id);
        return Ok(axum::http::StatusCode::NOT_FOUND.into_response());
    };
    let file = tokio::fs::File::open(file.path()).await?;
    let stream = tokio_util::io::ReaderStream::new(file);
    let body = axum::body::StreamBody::new(stream);
    Ok(body.into_response())
}

#[cfg(test)]
mod test {
    use super::*;

    fn setup() {
        let _ = dotenv::from_path("../.env");
        let _ = dotenv::dotenv();
    }

    #[tokio::test]
    async fn test_root_get() {
        setup();
        let response = root_get().await;
        assert_eq!(response.0.code, "ok");
    }

    #[tokio::test]
    async fn test_upload() {
        setup();
        let body = axum::http::Request::builder()
            .body(axum::body::Body::from("test data"))
            .unwrap();
        let response = upload(body).await.unwrap();
        assert_eq!(response.0.code, "ok");
        assert!(response.0.url.contains("/download/"));
    }

    #[tokio::test]
    async fn test_download() {
        setup();
        let body = axum::http::Request::builder()
            .body(axum::body::Body::from("test data"))
            .unwrap();
        let upload_response = upload(body).await.unwrap();
        let url = upload_response.0.url;
        let id = url.split('/').next_back().unwrap();

        let response = download_get(Path(id.to_string())).await;
        assert!(response.is_ok());
        assert_eq!(
            response
                .unwrap()
                .into_response()
                .into_body()
                .data()
                .await
                .unwrap()
                .unwrap(),
            b"test data".to_vec()
        );
    }
}
