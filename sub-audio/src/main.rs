use actix_web::delete;
use actix_web::{middleware, HttpResponse};
use log::info;
use rand::distributions::Alphanumeric;
use rand::distributions::DistString;
use std::collections::HashMap;
use std::env;
use std::sync::Mutex;
use tokio::io::AsyncWriteExt;
use tokio_util::io::ReaderStream;

use std::process;
use tokio::fs::{remove_file, File};

use once_cell::sync::Lazy;

use actix_web::middleware::Logger;
use actix_web::{get, post, web, App, HttpServer, Responder};

use serde::{Deserialize, Serialize};

static BACKEND_HOST: Lazy<String> = Lazy::new(|| env::var("BACKEND_HOST").unwrap());
static ID_TO_FILE_PATHS: Lazy<Mutex<HashMap<String, String>>> =
    Lazy::new(|| Mutex::new(HashMap::new()));

#[derive(Serialize)]
struct Root<'a> {
    code: &'a str,
}

#[derive(Deserialize)]
struct ConvertParam {
    url: String,
}

#[derive(Serialize)]
struct ConvertResponse {
    code: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    bgm_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    preview_id: Option<String>,
}

#[get("/")]
async fn root() -> impl Responder {
    web::Json(Root { code: "ok" })
}

#[post("/convert")]
async fn convert_web(params: web::Json<ConvertParam>) -> impl Responder {
    let result = convert(params.url.to_string()).await;
    if let Ok(response) = result {
        web::Json(response)
    } else {
        web::Json(ConvertResponse {
            code: result.err().unwrap(),
            bgm_id: None,
            preview_id: None,
        })
    }
}

async fn convert(url: String) -> Result<ConvertResponse, String> {
    let client = reqwest::Client::new();
    let original_url = format!("{}{}", BACKEND_HOST.as_str(), url);
    info!("original_url: {}", original_url);
    let res = client
        .get(original_url)
        .send()
        .await
        .map_err(|_| "failed_to_fetch")?;
    info!("status: {}", res.status());
    if !res.status().is_success() {
        return Err("failed_to_fetch".to_string());
    }
    let body = res.bytes().await.map_err(|_| "failed_to_fetch")?;
    let input_path = format!(
        "{}/{}.mp3",
        env::temp_dir().to_str().unwrap(),
        Alphanumeric.sample_string(&mut rand::thread_rng(), 10)
    );
    let mut input_file = File::create(input_path.clone())
        .await
        .map_err(|_| "failed_to_prepare")?;
    input_file
        .write_all(&body)
        .await
        .map_err(|_| "failed_to_prepare")?;

    let bgm_id = Alphanumeric.sample_string(&mut rand::thread_rng(), 16);
    let bgm_path = format!("{}/{}.mp3", env::temp_dir().to_str().unwrap(), bgm_id);

    let preview_id = Alphanumeric.sample_string(&mut rand::thread_rng(), 16);
    let preview_path = format!("{}/{}.mp3", env::temp_dir().to_str().unwrap(), preview_id);

    let mut bgm_process = process::Command::new("ffmpeg")
        .args([
            "-i",
            input_path.as_str(),
            "-b:a",
            "192k",
            "-ac",
            "2",
            "-ar",
            "24000",
            "-acodec",
            "libmp3lame",
            "-f",
            "mp3",
            "-y",
            bgm_path.as_str(),
        ])
        .stdout(process::Stdio::null())
        .stderr(process::Stdio::null())
        .spawn()
        .map_err(|_| "failed_to_execute_ffmpeg")?;

    let mut preview_process = process::Command::new("ffmpeg")
        .args([
            "-i",
            input_path.as_str(),
            "-b:a",
            "128k",
            "-ac",
            "1",
            "-ar",
            "24000",
            "-acodec",
            "libmp3lame",
            "-to",
            "20",
            "-af",
            "afade=t=out:st=17:d=3",
            "-f",
            "mp3",
            "-y",
            preview_path.as_str(),
        ])
        .stdout(process::Stdio::null())
        .stderr(process::Stdio::null())
        .spawn()
        .map_err(|_| "failed_to_execute_ffmpeg")?;

    info!("waiting for ffmpeg");
    let bgm_code = bgm_process.wait().map_err(|_| "failed_to_execute_ffmpeg")?;
    let preview_code = preview_process
        .wait()
        .map_err(|_| "failed_to_execute_ffmpeg")?;
    info!(
        "ffmpeg finished, bgm: {}, preview: {}",
        bgm_code.code().unwrap(),
        preview_code.code().unwrap()
    );

    let mut id_to_file_paths = ID_TO_FILE_PATHS.lock().unwrap();
    info!(
        "result: bgm[{}] => {}, preview[{}] => {}",
        &bgm_id, &bgm_path, &preview_id, &preview_path
    );

    id_to_file_paths.insert(bgm_id.clone(), bgm_path);
    id_to_file_paths.insert(preview_id.clone(), preview_path);
    Ok(ConvertResponse {
        code: "ok".to_string(),
        bgm_id: Some(bgm_id),
        preview_id: Some(preview_id),
    })
}

#[get("/download/{id}")]
async fn download(id: web::Path<String>) -> impl Responder {
    let path = {
        let id_to_file_paths = ID_TO_FILE_PATHS.lock().unwrap();
        id_to_file_paths.get(id.as_str()).cloned()
    };
    if path.is_none() {
        return HttpResponse::NotFound().json(Root { code: "not_found" });
    }
    info!("download: {} => {}", id, path.as_ref().unwrap());
    let file = File::open(path.unwrap()).await.unwrap();
    let stream = ReaderStream::new(file);

    HttpResponse::Ok()
        .content_type("audio/mpeg")
        .streaming(stream)
}

#[delete("/download/{id}")]
async fn cleanup(id: web::Path<String>) -> impl Responder {
    let path = {
        let mut id_to_file_paths = ID_TO_FILE_PATHS.lock().unwrap();
        id_to_file_paths.remove(id.as_str())
    };
    if path.is_none() {
        return web::Json(Root { code: "not_found" });
    }

    info!("removing {}", path.as_ref().unwrap());
    remove_file(path.as_ref().unwrap()).await.unwrap();
    web::Json(Root { code: "ok" })
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();
    dotenv::from_path("../.env").ok();
    env::set_var("RUST_LOG", "info");
    env_logger::init();

    info!("BACKEND_HOST = {}", BACKEND_HOST.as_str());

    HttpServer::new(|| {
        App::new()
            .wrap(Logger::default())
            .wrap(middleware::Compress::default())
            .service(root)
            .service(convert_web)
            .service(download)
            .service(cleanup)
    })
    .bind(("0.0.0.0", 3202))
    .map(|server| {
        info!("Server started on port 3202");
        server
    })
    .unwrap()
    .run()
    .await
}
