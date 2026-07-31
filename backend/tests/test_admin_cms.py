from httpx import AsyncClient


async def test_interest_crud_roundtrip(admin_client: AsyncClient):
    create = await admin_client.post("/admin/interests", json={"text": "Robotics", "sort_order": 1})
    assert create.status_code == 201
    item_id = create.json()["id"]

    listing = await admin_client.get("/admin/interests")
    assert any(i["id"] == item_id for i in listing.json())

    update = await admin_client.put(f"/admin/interests/{item_id}", json={"text": "Robotics v2", "sort_order": 2})
    assert update.status_code == 200
    assert update.json()["text"] == "Robotics v2"

    delete = await admin_client.delete(f"/admin/interests/{item_id}")
    assert delete.status_code == 204

    listing_after = await admin_client.get("/admin/interests")
    assert all(i["id"] != item_id for i in listing_after.json())


async def test_cms_write_requires_admin(client: AsyncClient):
    response = await client.post("/admin/interests", json={"text": "Nope", "sort_order": 0})
    assert response.status_code == 401


async def test_update_missing_project_returns_404(admin_client: AsyncClient):
    response = await admin_client.put(
        "/admin/projects/does-not-exist",
        json={
            "id": "does-not-exist",
            "name": "X",
            "tagline": "X",
            "description": "X",
            "stack": [],
        },
    )
    assert response.status_code == 404
