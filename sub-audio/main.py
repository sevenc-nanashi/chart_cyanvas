import asyncio
import logging
import os
import subprocess
import urllib.parse
from secrets import token_urlsafe
from tempfile import NamedTemporaryFile

import fastapi
from dotenv import load_dotenv
from pydantic import BaseModel
from redis import asyncio as aioredis

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

load_dotenv()
load_dotenv(dotenv_path="../.env")

BACKEND_HOST = os.getenv("BACKEND_HOST")
if BACKEND_HOST is None:
    raise Exception("BACKEND_HOST is not set")
print(f"BACKEND_HOST = {BACKEND_HOST}")

if sentry_dsn := os.getenv("SENTRY_DSN_SUB_AUDIO"):
    import sentry_sdk

    traits_sample_rate = float(os.getenv("SENTRY_TRACE_SAMPLE_RATE", "0.01"))
    sentry_sdk.init(sentry_dsn, traces_sample_rate=traits_sample_rate)

app = fastapi.FastAPI()
redis = aioredis.from_url(os.getenv("REDIS_URL"), decode_responses=True)


@app.get("/")
async def read_root():
    return {"code": "ok"}


class ConvertParam(BaseModel):
    url: str


@app.post("/convert")
async def convert(param: ConvertParam):
    url = urllib.parse.urljoin(BACKEND_HOST, param.url)

    logger.info(f"convert: url={url}")
    dist_bgm_file = NamedTemporaryFile(delete=False, suffix=".mp3")
    dist_bgm_file.close()
    dist_preview_file = NamedTemporaryFile(delete=False, suffix=".mp3")
    dist_preview_file.close()

    bgm_process = subprocess.Popen(
        [
            "ffmpeg",
            "-y",
            "-i",
            url,
            "-c:a",
            "libmp3lame",
            "-b:a",
            "192k",
            "-ac",
            "2",
            "-ar",
            "44100",
            dist_bgm_file.name,
        ]
    )
    preview_process = subprocess.Popen(
        [
            "ffmpeg",
            "-y",
            "-i",
            url,
            "-c:a",
            "libmp3lame",
            "-b:a",
            "96k",
            "-ac",
            "1",
            "-ar",
            "24000",
            "-af",
            "atrim=start=0:end=15,afade=t=out:st=13:d=2",
            dist_preview_file.name,
        ]
    )
    while bgm_process.poll() is None or preview_process.poll() is None:
        await asyncio.sleep(0.1)
    logger.info(f"convert: bgm_process={bgm_process.returncode}, preview_process={preview_process.returncode}")
    if bgm_process.returncode != 0 or preview_process.returncode != 0:
        raise Exception(
            f"ffmpeg failed: bgm_process={bgm_process.returncode}, preview_process={preview_process.returncode}"
        )

    nonce = token_urlsafe(16)

    await redis.set(f"audio:{nonce}:bgm", dist_bgm_file.name)
    await redis.set(f"audio:{nonce}:preview", dist_preview_file.name)

    return {
        "code": "ok",
        "id": nonce,
    }


@app.get("/download/{nonce}:{type}")
async def download(nonce: str, type: str):
    if path := await redis.get(f"audio:{nonce}:{type}"):
        logger.info(f"download: nonce={nonce}, type={type}")
        return fastapi.responses.FileResponse(path)
    else:
        return {"code": "error"}, 404


@app.delete("/download/{nonce}:{type}")
async def delete(nonce: str, type: str):
    if path := await redis.get(f"audio:{nonce}:{type}"):
        logger.info(f"delete: nonce={nonce}, type={type}")
        os.remove(path)
        await redis.delete("image:" + nonce)
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
