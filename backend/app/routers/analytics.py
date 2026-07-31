from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models import AnalyticsEvent
from app.schemas import AnalyticsEventIn

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.post("/event", status_code=201)
async def record_event(payload: AnalyticsEventIn, db: AsyncSession = Depends(get_db)):
    event = AnalyticsEvent(
        event_type=payload.event_type,
        payload=payload.payload,
        session_id=payload.session_id,
        path=payload.path,
    )
    db.add(event)
    await db.commit()
    return {"ok": True}
