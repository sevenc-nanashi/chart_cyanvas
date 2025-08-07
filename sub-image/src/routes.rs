use axum::Json;
use tracing::{info, warn};

use crate::{
    models::{ConvertResponse, RootResponse, UploadResponse},
    result::Result,
};

pub async fn root_get() -> Json<RootResponse> {
    Json(RootResponse {
        code: "ok".to_string(),
    })
}

pub async fn convert_post(
    body: Json<crate::models::ConvertRequest>,
) -> Result<Json<ConvertResponse>> {
    let sub_file_storage_host =
        std::env::var("HOSTS_SUB_TEMP_STORAGE").expect("HOSTS_SUB_TEMP_STORAGE must be set");
    info!("Convert: {:?}", body);
    let base_image = reqwest::get(&if body.url.starts_with("http://")
        || body.url.starts_with("https://")
    {
        body.url.clone()
    } else {
        return Err(anyhow::anyhow!("Invalid URL: {}. URLs must be absolute.", body.url).into());
    })
    .await?
    .bytes()
    .await?;
    let base_image: image::RgbaImage = image::load_from_memory(&base_image)?.into_rgba8();

    let result_image = tokio::task::spawn_blocking(move || match body.r#type {
        crate::models::ConvertType::Cover => {
            let main_color: image::Rgba<u8> =
                *image::imageops::resize(&base_image, 1, 1, image::imageops::FilterType::Gaussian)
                    .get_pixel(0, 0);
            let mut target_image = image::RgbaImage::from_fn(512, 512, |_, _| main_color);
            let (width, height) = base_image.dimensions();
            if width > height {
                let new_height = 512 * height / width;
                image::imageops::overlay(
                    &mut target_image,
                    &image::imageops::resize(
                        &base_image,
                        512,
                        new_height,
                        image::imageops::FilterType::Gaussian,
                    ),
                    0,
                    ((512 - new_height) / 2) as i64,
                );
            } else {
                let new_width = 512 * width / height;
                image::imageops::overlay(
                    &mut target_image,
                    &image::imageops::resize(
                        &base_image,
                        new_width,
                        512,
                        image::imageops::FilterType::Gaussian,
                    ),
                    ((512 - new_width) / 2) as i64,
                    0,
                );
            }

            target_image
        }
        crate::models::ConvertType::BackgroundV1 => {
            let mut rendered = pjsekai_background_gen_core::render_v1(&base_image);
            let img = image::imageops::crop(&mut rendered, 0, 145, 2048, 970).to_image();
            image::imageops::resize(
                &img,
                ((img.width() as f64 / img.height() as f64) * 720f64) as _,
                720,
                image::imageops::FilterType::Gaussian,
            )
        }
        crate::models::ConvertType::BackgroundV3 => {
            let mut rendered = pjsekai_background_gen_core::render_v3(&base_image);
            let img = image::imageops::crop(&mut rendered, 0, 135, 2048, 897).to_image();
            image::imageops::resize(
                &img,
                ((img.width() as f64 / img.height() as f64) * 720f64) as _,
                720,
                image::imageops::FilterType::Gaussian,
            )
        }
        crate::models::ConvertType::BackgroundTabletV1 => {
            let img = pjsekai_background_gen_core::render_v1(&base_image);
            image::imageops::resize(
                &img,
                (img.width() as f64 / img.height() as f64 * 720f64) as _,
                720,
                image::imageops::FilterType::Gaussian,
            )
        }
        crate::models::ConvertType::BackgroundTabletV3 => {
            let img = pjsekai_background_gen_core::render_v3(&base_image);
            image::imageops::resize(
                &img,
                (img.width() as f64 / img.height() as f64 * 720f64) as _,
                720,
                image::imageops::FilterType::Gaussian,
            )
        }
    })
    .await?;

    let temp_file = tempfile::Builder::new().suffix(".jpg").tempfile().unwrap();
    result_image.save(temp_file.path())?;

    let response = reqwest::Client::new()
        .post(format!("{sub_file_storage_host}/upload"))
        .header("Content-Type", "application/octet-stream")
        .body(tokio::fs::read(temp_file.path()).await?)
        .send()
        .await?;
    if !response.status().is_success() {
        warn!("Failed to upload image: {}", response.status());
        return Err(anyhow::anyhow!("Failed to upload image").into());
    }
    let upload_response: UploadResponse = serde_json::from_str(&response.text().await?)?;

    Ok(Json(ConvertResponse {
        code: "ok".to_string(),
        url: upload_response.url,
    }))
}

#[cfg(test)]
mod test {
    use super::*;
    use rstest::rstest;

    fn load_env() {
        let _ = dotenv::from_path("../.env");
        let _ = dotenv::dotenv();
    }

    #[tokio::test]
    async fn test_root_get() {
        let response = root_get().await;
        assert_eq!(response.0.code, "ok");
    }

    #[rstest]
    #[case(
        "square",
        crate::models::ConvertType::Cover,
        "https://raw.githubusercontent.com/sevenc-nanashi/pjsekai-background-gen-rust/main/crates/core/test.png"
    )]
    #[case(
        "horizontal",
        crate::models::ConvertType::Cover,
        "https://i.imgur.com/Gsd3bk9.png"
    )]
    #[case(
        "vertical",
        crate::models::ConvertType::Cover,
        "https://i.imgur.com/0r1Qebn.png"
    )]
    #[case(
        "bg_v1",
        crate::models::ConvertType::BackgroundV1,
        "https://raw.githubusercontent.com/sevenc-nanashi/pjsekai-background-gen-rust/main/crates/core/test.png"
    )]
    #[case(
        "bg_v3",
        crate::models::ConvertType::BackgroundV3,
        "https://raw.githubusercontent.com/sevenc-nanashi/pjsekai-background-gen-rust/main/crates/core/test.png"
    )]
    #[tokio::test]
    async fn test_convert_post_cover(
        #[case] dist: &str,
        #[case] r#type: crate::models::ConvertType,
        #[case] url: &str,
    ) {
        load_env();
        let response = convert_post(Json(crate::models::ConvertRequest {
            r#type,
            url: url.to_string(),
        }))
        .await
        .unwrap();
        assert_eq!(response.0.code, "ok");

        let downloaded = reqwest::get(&response.0.url)
            .await
            .unwrap()
            .bytes()
            .await
            .unwrap();
        tokio::fs::write(format!("../test_results/test_cover_{dist}.png"), downloaded)
            .await
            .unwrap();
    }
}
