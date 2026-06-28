from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from gradio_client import Client, handle_file
import httpx
import shutil
import os
import uuid
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Suppress noisy heartbeat 404 logs from gradio_client
logging.getLogger("httpx").setLevel(logging.WARNING)
app = FastAPI(title="Virtual Try-On Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

try:
    vton_client = Client("yisol/IDM-VTON")
    logger.info("Connected to IDM-VTON Hugging Face Space")
except Exception as e:
    logger.error(f"Failed to connect to IDM-VTON space: {e}")
    vton_client = None


def save_upload(file: UploadFile, prefix: str) -> str:
    ext = os.path.splitext(file.filename)[1] or ".jpg"
    filename = f"{prefix}_{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return filepath


# async def download_garment_image(url: str) -> str:
#     async with httpx.AsyncClient() as client:
#         resp = await client.get(url, timeout=30.0)
#         resp.raise_for_status()
#     ext = os.path.splitext(url.split("?")[0])[1] or ".jpg"
#     filepath = os.path.join(UPLOAD_DIR, f"garment_{uuid.uuid4().hex}{ext}")
#     with open(filepath, "wb") as f:
#         f.write(resp.content)
#     return filepath

async def download_garment_image(url: str) -> str:
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
    }
    async with httpx.AsyncClient(follow_redirects=True) as client:
        resp = await client.get(url, timeout=30.0, headers=headers)
        resp.raise_for_status()

    # .jfif is JPEG — force .jpg extension so PIL/gradio can read it
    raw_path = url.split("?")[0]
    ext = os.path.splitext(raw_path)[1].lower()
    if ext in (".jfif", ".jpe", ""):
        ext = ".jpg"

    filepath = os.path.join(UPLOAD_DIR, f"garment_{uuid.uuid4().hex}{ext}")
    with open(filepath, "wb") as f:
        f.write(resp.content)
    return filepath


@app.post("/api/vton/image")
async def virtual_tryon(
    person_image: UploadFile = File(...),
    garment_image_url: str = Form(...),
    garment_description: str = Form(""),
):
    if vton_client is None:
        raise HTTPException(status_code=503, detail="Try-on service unavailable")

    person_path = None
    garment_path = None

    try:
        person_path = save_upload(person_image, "person")
        garment_path = await download_garment_image(garment_image_url)

        logger.info(f"Running try-on: person={person_path}, garment={garment_path}")

        result = vton_client.predict(
            dict={"background": handle_file(person_path), "layers": [], "composite": None},
            garm_img=handle_file(garment_path),
            garment_des=garment_description,
            is_checked=True,
            is_checked_crop=False,
            denoise_steps=30,
            seed=42,
            api_name="/tryon",
        )

        output_path = result[0]
        logger.info(f"Try-on complete: {output_path}")

        with open(output_path, "rb") as f:
            image_bytes = f.read()

        return Response(content=image_bytes, media_type="image/png")

    except httpx.HTTPError as e:
        logger.error(f"Failed to download garment image: {e}")
        raise HTTPException(status_code=400, detail="Could not fetch garment image")

    except Exception as e:
        logger.error(f"Try-on failed: {e}")
        raise HTTPException(status_code=500, detail=f"Try-on generation failed: {str(e)}")

    finally:
        for path in [person_path, garment_path]:
            if path and os.path.exists(path):
                os.remove(path)


@app.get("/health")
async def health():
    return {"status": "ok", "vton_connected": vton_client is not None}
