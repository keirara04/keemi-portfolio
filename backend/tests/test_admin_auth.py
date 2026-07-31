from httpx import AsyncClient

from app.config import settings


async def test_login_success_sets_cookie(client: AsyncClient):
    response = await client.post(
        "/admin/login",
        json={"email": settings.admin_email, "password": settings.admin_password},
    )
    assert response.status_code == 200
    assert "keemi_admin_session" in response.cookies


async def test_login_wrong_password_rejected(client: AsyncClient):
    response = await client.post(
        "/admin/login",
        json={"email": settings.admin_email, "password": "not-the-password"},
    )
    assert response.status_code == 401


async def test_login_unknown_email_rejected(client: AsyncClient):
    response = await client.post(
        "/admin/login",
        json={"email": "nobody@example.com", "password": "whatever"},
    )
    assert response.status_code == 401
