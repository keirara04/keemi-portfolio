import os

os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://keemi:devpass@localhost:55432/keemi_portfolio_test")
os.environ.setdefault("JWT_SECRET", "test-secret")
os.environ.setdefault("ADMIN_EMAIL", "admin@example.com")
os.environ.setdefault("ADMIN_PASSWORD", "test-password")

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.auth import hash_password
from app.config import settings
from app.db import Base
from app.main import app
from app.models import AdminUser

test_engine = create_async_engine(settings.database_url)
TestSession = async_sessionmaker(test_engine, expire_on_commit=False)


@pytest.fixture(autouse=True)
async def _reset_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with TestSession() as session:
        session.add(
            AdminUser(email=settings.admin_email, password_hash=hash_password(settings.admin_password))
        )
        await session.commit()

    yield


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="https://test") as ac:
        yield ac


@pytest.fixture
async def admin_client(client: AsyncClient):
    response = await client.post(
        "/admin/login",
        json={"email": settings.admin_email, "password": settings.admin_password},
    )
    assert response.status_code == 200
    return client
