import aiohttp
import asyncio
import logging
import os
import subprocess
from tempfile import NamedTemporaryFile

import fastapi
from dotenv import load_dotenv
from pydantic import BaseModel

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

load_dotenv()
load_dotenv(dotenv_path="../.env")

HOSTS_SUB_TEMP_STORAGE = os.getenv("HOSTS_SUB_TEMP_STORAGE")
if not HOSTS_SUB_TEMP_STORAGE:
    raise Exception("HOSTS_SUB_TEMP_STORAGE environment variable is not set")

if sentry_dsn := os.getenv("SENTRY_DSN_SUB_AUDIO"):
    import sentry_sdk

    traits_sample_rate = float(os.getenv("SENTRY_TRACE_SAMPLE_RATE", "0.01"))
    sentry_sdk.init(sentry_dsn, traces_sample_rate=traits_sample_rate)

app = fastapi.FastAPI()


@app.get("/")
async def read_root():
    return {"code": "ok"}


class ConvertParam(BaseModel):
    url: str


@app.post("/convert")
async def convert(param: ConvertParam):
    url = param.url.strip()
    logger.info(f"convert: url={url}")
    dist_bgm_file = NamedTemporaryFile(delete=False, suffix=".mp3")
    dist_bgm_file.close()
    dist_preview_file = NamedTemporaryFile(delete=False, suffix=".mp3")
    dist_preview_file.close()

    dist_base_file = NamedTemporaryFile(delete=False)
    with open(dist_base_file.name, "wb") as f:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status != 200:
                    raise Exception(f"Failed to download file: {response.status}")
                content = await response.read()
                f.write(content)
    logger.info(f"convert: downloaded file to {dist_base_file.name}")

    bgm_process = subprocess.Popen(
        [
            "ffmpeg",
            "-y",
            "-i",
            dist_base_file.name,
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
            dist_base_file.name,
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
    logger.info(
        f"convert: bgm_process={bgm_process.returncode}, preview_process={preview_process.returncode}"
    )
    if bgm_process.returncode != 0 or preview_process.returncode != 0:
        raise Exception(
            f"ffmpeg failed: bgm_process={bgm_process.returncode}, preview_process={preview_process.returncode}"
        )

    async with aiohttp.ClientSession() as session:
        async with session.post(
            f"{HOSTS_SUB_TEMP_STORAGE}/upload",
            data=open(dist_bgm_file.name, "rb"),
        ) as response:
            if response.status != 200:
                raise Exception(f"Failed to upload BGM file: {response.status}")
            bgm_url = (await response.json())["url"]

        async with session.post(
            f"{HOSTS_SUB_TEMP_STORAGE}/upload",
            data=open(dist_preview_file.name, "rb"),
        ) as response:
            if response.status != 200:
                raise Exception(f"Failed to upload preview file: {response.status}")
            preview_url = (await response.json())["url"]

    logger.info(f"convert: bgm_url={bgm_url}, preview_url={preview_url}")
    os.remove(dist_bgm_file.name)
    os.remove(dist_preview_file.name)
    os.remove(dist_base_file.name)
    return {
        "code": "ok",
        "bgm_url": bgm_url,
        "preview_url": preview_url,
    }


@app.exception_handler(Exception)
async def exception_handler(request, exc):
    return fastapi.responses.JSONResponse(
        status_code=500,
        content={"code": "error", "message": str(exc)},
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", port=3202, reload=True)
