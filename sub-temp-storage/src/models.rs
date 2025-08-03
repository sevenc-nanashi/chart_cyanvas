use serde::Serialize;

#[derive(Serialize, Debug)]
pub struct RootResponse {
    pub code: String,
}

#[derive(Serialize, Debug)]
pub struct UploadResponse {
    pub code: String,
    pub url: String,
}

#[derive(Serialize, Debug)]
pub struct ErrorResponse {
    pub code: String,
    pub message: String,
}
