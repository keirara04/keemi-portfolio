import logging

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.email import send_contact_notification
from app.models import ContactSubmission
from app.schemas import ContactSubmissionIn

router = APIRouter(tags=["contact"])
logger = logging.getLogger(__name__)


@router.post("/contact", status_code=201)
async def submit_contact(payload: ContactSubmissionIn, db: AsyncSession = Depends(get_db)):
    submission = ContactSubmission(
        from_name=payload.from_name,
        subject=payload.subject,
        body=payload.body,
    )
    db.add(submission)

    try:
        send_contact_notification(payload.from_name, payload.subject, payload.body)
        submission.email_status = "sent"
    except Exception:
        logger.exception("Failed to send contact notification email")
        submission.email_status = "failed"

    await db.commit()
    return {"ok": True}
