import os
import fastapi
from pydantic import BaseModel
from tempfile import NamedTemporaryFile
from secrets import token_urlsafe
from dotenv import load_dotenv
import logging
import urllib.parse
import redis
import ffmpeg
import subprocess

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

load_dotenv()
load_dotenv(dotenv_path="../.env")

BACKEND_HOST = os.getenv("BACKEND_HOST")
if BACKEND_HOST is None:
    raise Exception("BACKEND_HOST is not set")
print(f"BACKEND_HOST = {BACKEND_HOST}")
SIZE = 512

app = fastapi.FastAPI(docs_url=None, redoc_url=None)
redis = redis.from_url(os.getenv("REDIS_URL"), decode_responses=True)


@app.get("/")
def read_root():
    return {"code": "ok"}


class ConvertParam(BaseModel):
    url: str


@app.post("/convert")
def convert(param: ConvertParam):
    url = urllib.parse.urljoin(BACKEND_HOST, param.url)

    logger.info(f"convert: url={url}")
    dist_bgm_file = NamedTemporaryFile(delete=False, suffix=".mp3")
    dist_bgm_file.close()
    dist_preview_file = NamedTemporaryFile(delete=False, suffix=".mp3")
    dist_preview_file.close()

    bgm_args = (
        ffmpeg.input(url)
        .audio.output(dist_bgm_file.name, **{"c:a": "libmp3lame", "b:a": "192k", "ac": 2, "ar": 44100})
        .overwrite_output()
    )
    preview_args = (
        ffmpeg.input(url)
        .audio.filter("atrim", start=0, end=15)
        .filter("afade", t="out", st=13, d=2)
        .output(dist_preview_file.name, **{"c:a": "libmp3lame", "b:a": "96k", "ac": 1, "ar": 24000})
        .overwrite_output()
    )

    logger.info(f"convert: bgm_args={bgm_args.compile()}, preview_args={preview_args.compile()}")
    bgm_process = subprocess.Popen(bgm_args.compile(), stdout=subprocess.PIPE)
    preview_process = subprocess.Popen(preview_args.compile(), stdout=subprocess.PIPE)
    bgm_process.wait()
    preview_process.wait()
    logger.info(f"convert: bgm_process={bgm_process.returncode}, preview_process={preview_process.returncode}")
    if bgm_process.returncode != 0 or preview_process.returncode != 0:
        raise Exception("ffmpeg process failed")

    nonce = token_urlsafe(16)

    redis.set(f"audio:{nonce}:bgm", dist_bgm_file.name)
    redis.set(f"audio:{nonce}:preview", dist_preview_file.name)

    return {
        "code": "ok",
        "id": nonce,
    }


@app.get("/download/{nonce}:{type}")
def download(nonce: str, type: str):
    if path := redis.get(f"audio:{nonce}:{type}"):
        logger.info(f"download: nonce={nonce}, type={type}")
        return fastapi.responses.FileResponse(path)
    else:
        return {"code": "error"}, 404


@app.delete("/download/{nonce}:{type}")
def delete(nonce: str, type: str):
    if path := redis.get(f"audio:{nonce}:{type}"):
        logger.info(f"delete: nonce={nonce}, type={type}")
        os.remove(path)
        redis.delete("image:" + nonce)
        return {"code": "ok"}
    else:
        return {"code": "error"}, 404


@app.exception_handler(Exception)
async def exception_handler(request, exc):
    return fastapi.responses.JSONResponse(
        status_code=500,
        content={"code": "error", "message": str(exc)},
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", port=3202, reload=True)
