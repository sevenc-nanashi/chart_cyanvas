from __future__ import annotations

import asyncio
import io
import logging
import os
import urllib.parse
from secrets import token_urlsafe
from tempfile import NamedTemporaryFile

import aiohttp
import fastapi
from dotenv import load_dotenv
from PIL import Image, ImageFile
from pjsekai_background_gen_pillow import Generator
from pydantic import BaseModel
from redis import asyncio as aioredis

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

load_dotenv()
load_dotenv(dotenv_path="../.env")

ImageFile.LOAD_TRUNCATED_IMAGES = True

BACKEND_HOST = os.getenv("BACKEND_HOST")
if BACKEND_HOST is None:
    raise Exception("BACKEND_HOST is not set")
print(f"BACKEND_HOST = {BACKEND_HOST}")
SIZE = 512

if sentry_dsn := os.getenv("SENTRY_DSN_SUB_AUDIO"):
    import sentry_sdk

    traits_sample_rate = float(os.getenv("SENTRY_TRACE_SAMPLE_RATE", "0.01"))
    sentry_sdk.init(sentry_dsn, traces_sample_rate=traits_sample_rate)

app = fastapi.FastAPI(docs_url=None, redoc_url=None)
redis = aioredis.from_url(
    os.getenv("REDIS_URL"),
    decode_responses=True,
)
bg_gen = Generator()


@app.get("/")
async def read_root():
    return {"code": "ok"}


class ConvertParam(BaseModel):
    url: str
    type: str


@app.post("/convert")
async def convert(param: ConvertParam):
    url = urllib.parse.urljoin(BACKEND_HOST, param.url)

    logger.info(f"convert: url={url}")
    content: bytes | None = None
    async with aiohttp.ClientSession() as session:
        for i in range(5):
            try:
                async with session.get(url) as resp:
                    resp.raise_for_status()
                    content = await resp.read()

                    break
            except Exception as e:
                logger.error(f"convert: url={url} error={e} try={i}/5")
                await asyncio.sleep(2**i)

    if content is None:
        logger.error(f"convert: url={url} error=failed to get image")
        return {"code": "error"}, 500
    base_file = io.BytesIO(content)
    img = Image.open(base_file)
    img = img.convert("RGBA")
    if param.type == "cover":
        if img.width > img.height:
            img = img.resize((SIZE, SIZE * img.height // img.width))
        elif img.width < img.height:
            img = img.resize((SIZE * img.width // img.height, SIZE))
        else:
            img = img.resize((SIZE, SIZE))
        img_color = img.resize((1, 1))
        dist_img = img_color.resize((SIZE, SIZE)).convert("RGBA")
        dist_file = NamedTemporaryFile(suffix=".png", delete=False)
        extended_img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
        extended_img.paste(img, (SIZE // 2 - img.width // 2, SIZE // 2 - img.height // 2))
        Image.alpha_composite(dist_img, extended_img).save(dist_file.name)
        dist_file.close()
        nonce = token_urlsafe(16)
        await redis.set("image:" + nonce, dist_file.name)
        logger.info(f"convert(cover): nonce={nonce}")
    elif param.type == "background":
        background = bg_gen.generate(img)
        background_file = NamedTemporaryFile(suffix=".jpg", delete=False)
        background.save(background_file.name)
        background_file.close()
        nonce = token_urlsafe(16)
        await redis.set("image:" + nonce, background_file.name)
        logger.info(f"convert(background): nonce={nonce}")
    else:
        return {"code": "unknown_type"}, 400

    return {
        "code": "ok",
        "id": nonce,
    }


@app.get("/download/{nonce}")
async def download(nonce: str):
    if path := await redis.get("image:" + nonce):
        logger.info(f"download: nonce={nonce}")
        return fastapi.responses.FileResponse(path)
    else:
        return {"code": "error"}, 404


@app.delete("/download/{nonce}")
async def delete(nonce: str):
    if path := await redis.get("image:" + nonce):
        logger.info(f"delete: nonce={nonce}")
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

    uvicorn.run("main:app", port=3203, reload=True)
