use std::{collections::HashMap, sync::Arc};

use axum::{extract::Path, Json};
use once_cell::sync::Lazy;
use tempfile::NamedTempFile;
use tokio::{io::AsyncReadExt, sync::Mutex};

use crate::{
    models::{ConvertResponse, RootResponse},
    result::Result,
};

static FILES: Lazy<Arc<Mutex<HashMap<String, NamedTempFile>>>> =
    Lazy::new(|| Arc::new(Mutex::new(HashMap::new())));

pub async fn root_get() -> Json<RootResponse> {
    Json(RootResponse {
        code: "ok".to_string(),
    })
}

pub async fn convert_post(
    body: Json<crate::models::ConvertRequest>,
) -> Result<Json<ConvertResponse>> {
    let base_image = reqwest::get(&body.url).await?.bytes().await?;
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
            image::imageops::crop(&mut rendered, 0, 145, 2048, 970).to_image()
        }
        crate::models::ConvertType::BackgroundV3 => {
            let mut rendered = pjsekai_background_gen_core::render_v3(&base_image);
            image::imageops::crop(&mut rendered, 0, 135, 2048, 897).to_image()
        }
    })
    .await?;

    let temp_file = tempfile::Builder::new().suffix(".png").tempfile().unwrap();
    result_image.save(temp_file.path())?;

    let id = uuid::Uuid::new_v4().to_string();
    FILES.lock().await.insert(id.clone(), temp_file);

    Ok(Json(ConvertResponse {
        code: "ok".to_string(),
        id,
    }))
}

pub async fn download_get(Path(id): Path<String>) -> Result<Vec<u8>> {
    let mut files = FILES.lock().await;
    let file = files
        .remove(&id)
        .ok_or_else(|| anyhow::anyhow!("not found"))?;
    let mut file = tokio::fs::File::open(file.path()).await?;
    let mut bytes = Vec::new();
    file.read_to_end(&mut bytes).await?;
    Ok(bytes)
}

#[cfg(test)]
mod test {
    use super::*;
    use rstest::rstest;

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
        "https://cdn.discordapp.com/attachments/847301818571816960/1158336309098725406/h.png"
    )]
    #[case(
        "vertical",
        crate::models::ConvertType::Cover,
        "https://cdn.discordapp.com/attachments/847301818571816960/1158336329994735616/v.png"
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
        let response = convert_post(Json(crate::models::ConvertRequest {
            r#type,
            url: url.to_string(),
        }))
        .await
        .unwrap();
        assert_eq!(response.0.code, "ok");
        assert!(!response.0.id.is_empty());

        let downloaded = download_get(Path(response.0.id)).await.unwrap();
        tokio::fs::write(
            format!("../test_results/test_cover_{}.png", dist),
            downloaded,
        )
        .await
        .unwrap();
    }
}