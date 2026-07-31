import smtplib
from email.message import EmailMessage

from app.config import settings


def send_contact_notification(from_name: str, subject: str, body: str) -> None:
    if not settings.smtp_host:
        raise RuntimeError("SMTP is not configured")

    message = EmailMessage()
    message["Subject"] = f"[Portfolio Contact] {subject}"
    message["From"] = settings.smtp_from
    message["To"] = settings.smtp_from
    message.set_content(f"From: {from_name}\n\n{body}")

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        server.starttls()
        server.login(settings.smtp_user, settings.smtp_pass)
        server.send_message(message)
