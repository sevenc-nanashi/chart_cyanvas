import os
import fastapi
from pydantic import BaseModel
from tempfile import NamedTemporaryFile
from PIL import Image
import requests
import io
from secrets import token_urlsafe
from pjsekai_background_gen_pillow import Generator
from dotenv import load_dotenv

load_dotenv()
load_dotenv(dotenv_path="../.env")

BACKEND_HOST = os.getenv("BACKEND_HOST")
if BACKEND_HOST is None:
    raise Exception("BACKEND_HOST is not set")
print(f"BACKEND_HOST = {BACKEND_HOST}")

app = fastapi.FastAPI(docs_url=None, redoc_url=None)
download_files = {}
bg_gen = Generator()


@app.get("/")
def read_root():
    return {"code": "ok"}


class ConvertParam(BaseModel):
    url: str


@app.post("/convert")
def convert(param: ConvertParam):
    url = param.url

    base_file = io.BytesIO(requests.get(BACKEND_HOST + url).content)
    img = Image.open(base_file)
    img = img.convert("RGBA")
    if img.width > img.height:
        img = img.resize((256, 256 * img.height // img.width))
    elif img.width < img.height:
        img = img.resize((256 * img.width // img.height, 256))
    img = img.resize((256, 256))
    img_color = img.resize((1, 1))
    dist_img = img_color.resize((256, 256)).convert("RGBA")
    dist_file = NamedTemporaryFile(suffix=".png", delete=False)
    Image.alpha_composite(dist_img, img).save(dist_file.name)
    dist_file.close()
    nonce = token_urlsafe(16)
    download_files[nonce] = dist_file.name

    background = bg_gen.generate(dist_img)
    background_file = NamedTemporaryFile(suffix=".png", delete=False)
    background.save(background_file.name)
    background_file.close()
    bg_nonce = token_urlsafe(16)
    download_files[bg_nonce] = background_file.name

    return {
        "code": "ok",
        "cover_id": nonce,
        "background_id": bg_nonce,
    }


@app.get("/download/{nonce}")
def download(nonce: str):
    if nonce in download_files:
        return fastapi.responses.FileResponse(download_files[nonce])
    else:
        return {"code": "error"}


@app.delete("/download/{nonce}")
def delete(nonce: str):
    if nonce in download_files:
        os.remove(download_files[nonce])
        del download_files[nonce]
        return {"code": "ok"}
    else:
        return {"code": "error"}


@app.exception_handler(Exception)
async def exception_handler(request, exc):
    return fastapi.responses.JSONResponse(
        status_code=500,
        content={"code": "error", "message": str(exc)},
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", port=3203, reload=True)
