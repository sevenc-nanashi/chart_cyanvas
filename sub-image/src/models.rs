use serde::{Deserialize, Serialize};

#[derive(Serialize, Debug)]
pub struct RootResponse {
    pub code: String,
}

#[derive(Deserialize, Debug)]
pub struct ConvertRequest {
    pub r#type: ConvertType,
    pub url: String,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "snake_case")]
pub enum ConvertType {
    Cover,
    BackgroundV1,
    BackgroundV3,
    BackgroundTabletV1,
    BackgroundTabletV3,
}

#[derive(Serialize, Debug)]
pub struct ConvertResponse {
    pub code: String,
    pub url: String,
}

#[derive(Deserialize, Debug)]
pub struct UploadResponse {
    // pub code: String,
    pub url: String,
}

#[derive(Serialize, Debug)]
pub struct ErrorResponse {
    pub code: String,
    pub message: String,
}
