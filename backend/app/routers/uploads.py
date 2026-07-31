import uuid
from io import BytesIO

import boto3
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from PIL import Image
from starlette.concurrency import run_in_threadpool

from app.auth import get_current_admin
from app.config import settings

router = APIRouter(prefix="/admin", tags=["uploads"])

ALLOWED_CONTENT_TYPES = {"image/png", "image/jpeg", "image/webp"}
MAX_UPLOAD_BYTES = 10 * 1024 * 1024
MAX_DIMENSION = 1600


def _process_and_upload(data: bytes) -> str:
    if not settings.spaces_bucket:
        raise RuntimeError("Spaces is not configured")

    image = Image.open(BytesIO(data)).convert("RGB")
    image.thumbnail((MAX_DIMENSION, MAX_DIMENSION))

    output = BytesIO()
    image.save(output, format="WEBP", quality=82)
    output.seek(0)

    key = f"uploads/{uuid.uuid4()}.webp"
    client = boto3.client(
        "s3",
        region_name=settings.spaces_region,
        endpoint_url=settings.spaces_endpoint,
        aws_access_key_id=settings.spaces_key,
        aws_secret_access_key=settings.spaces_secret,
    )
    client.put_object(
        Bucket=settings.spaces_bucket,
        Key=key,
        Body=output,
        ContentType="image/webp",
        ACL="public-read",
    )
    return f"{settings.spaces_cdn_url}/{key}"


@router.post("/uploads", status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    _admin: str = Depends(get_current_admin),
):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported file type")

    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File too large")

    try:
        url = await run_in_threadpool(_process_and_upload, data)
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

    return {"url": url}
