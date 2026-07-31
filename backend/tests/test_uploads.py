from io import BytesIO
from unittest.mock import MagicMock, patch

from httpx import AsyncClient
from PIL import Image


def _make_png_bytes(size=(50, 50)) -> bytes:
    buffer = BytesIO()
    Image.new("RGB", size, color="red").save(buffer, format="PNG")
    return buffer.getvalue()


async def test_upload_rejects_wrong_content_type(admin_client: AsyncClient):
    response = await admin_client.post(
        "/admin/uploads",
        files={"file": ("test.txt", b"not an image", "text/plain")},
    )
    assert response.status_code == 400


async def test_upload_rejects_oversized_file(admin_client: AsyncClient):
    huge = b"0" * (10 * 1024 * 1024 + 1)
    response = await admin_client.post(
        "/admin/uploads",
        files={"file": ("big.png", huge, "image/png")},
    )
    assert response.status_code == 400


async def test_upload_requires_admin(client: AsyncClient):
    response = await client.post(
        "/admin/uploads",
        files={"file": ("test.png", _make_png_bytes(), "image/png")},
    )
    assert response.status_code == 401


@patch("app.routers.uploads.boto3.client")
async def test_upload_resizes_and_uploads_to_spaces(mock_boto_client, admin_client: AsyncClient):
    from app.config import settings

    settings.spaces_bucket = "test-bucket"
    settings.spaces_cdn_url = "https://cdn.example.com"

    mock_s3 = MagicMock()
    mock_boto_client.return_value = mock_s3

    response = await admin_client.post(
        "/admin/uploads",
        files={"file": ("test.png", _make_png_bytes((3000, 2000)), "image/png")},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["url"].startswith("https://cdn.example.com/uploads/")
    assert body["url"].endswith(".webp")

    mock_s3.put_object.assert_called_once()
    call_kwargs = mock_s3.put_object.call_args.kwargs
    assert call_kwargs["Bucket"] == "test-bucket"
    assert call_kwargs["ContentType"] == "image/webp"
    assert call_kwargs["ACL"] == "public-read"

    settings.spaces_bucket = ""
    settings.spaces_cdn_url = ""


async def test_upload_fails_gracefully_when_spaces_not_configured(admin_client: AsyncClient):
    response = await admin_client.post(
        "/admin/uploads",
        files={"file": ("test.png", _make_png_bytes(), "image/png")},
    )
    assert response.status_code == 503
