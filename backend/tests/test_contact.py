from httpx import AsyncClient


async def test_submit_contact_persists_and_marks_email_status(client: AsyncClient, admin_client: AsyncClient):
    response = await client.post(
        "/contact",
        json={"from_name": "Ada", "subject": "Hello", "body": "Just saying hi"},
    )
    assert response.status_code == 201

    listing = await admin_client.get("/admin/contact-submissions")
    submissions = listing.json()
    assert len(submissions) == 1
    assert submissions[0]["from_name"] == "Ada"
    assert submissions[0]["email_status"] in ("sent", "failed")


async def test_submit_contact_rejects_empty_body(client: AsyncClient):
    response = await client.post(
        "/contact",
        json={"from_name": "Ada", "subject": "Hello", "body": ""},
    )
    assert response.status_code == 422
