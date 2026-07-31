from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import (
    SESSION_COOKIE_NAME,
    create_session_token,
    get_current_admin,
    verify_password,
)
from app.db import get_db
from app.models import AdminUser, AnalyticsEvent, ContactSubmission
from app.schemas import AdminLoginIn

router = APIRouter(prefix="/admin", tags=["admin"])

_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7


@router.post("/login")
async def login(payload: AdminLoginIn, response: Response, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AdminUser).where(AdminUser.email == payload.email))
    admin = result.scalar_one_or_none()

    if admin is None or not verify_password(payload.password, admin.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_session_token(admin.email)
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=_COOKIE_MAX_AGE_SECONDS,
    )
    return {"ok": True}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(SESSION_COOKIE_NAME)
    return {"ok": True}


@router.get("/contact-submissions")
async def list_contact_submissions(
    db: AsyncSession = Depends(get_db),
    _admin: str = Depends(get_current_admin),
):
    result = await db.execute(
        select(ContactSubmission).order_by(ContactSubmission.created_at.desc())
    )
    submissions = result.scalars().all()
    return [
        {
            "id": str(s.id),
            "from_name": s.from_name,
            "subject": s.subject,
            "body": s.body,
            "email_status": s.email_status,
            "created_at": s.created_at,
        }
        for s in submissions
    ]


@router.get("/analytics")
async def analytics_summary(
    db: AsyncSession = Depends(get_db),
    _admin: str = Depends(get_current_admin),
):
    result = await db.execute(
        select(AnalyticsEvent.event_type, func.count())
        .group_by(AnalyticsEvent.event_type)
        .order_by(func.count().desc())
    )
    counts_by_type = {event_type: count for event_type, count in result.all()}

    total_result = await db.execute(select(func.count()).select_from(AnalyticsEvent))
    total_events = total_result.scalar_one()

    sessions_result = await db.execute(select(func.count(func.distinct(AnalyticsEvent.session_id))))
    unique_sessions = sessions_result.scalar_one()

    return {
        "total_events": total_events,
        "unique_sessions": unique_sessions,
        "counts_by_event_type": counts_by_type,
    }
