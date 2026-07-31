from httpx import AsyncClient


async def test_record_event_and_admin_summary(client: AsyncClient, admin_client: AsyncClient):
    response = await client.post(
        "/analytics/event",
        json={"event_type": "minesweeper_win", "payload": {}, "session_id": "s1", "path": "/"},
    )
    assert response.status_code == 201

    summary = await admin_client.get("/admin/analytics")
    data = summary.json()
    assert data["total_events"] == 1
    assert data["unique_sessions"] == 1
    assert data["counts_by_event_type"] == {"minesweeper_win": 1}


async def test_analytics_summary_requires_admin(client: AsyncClient):
    response = await client.get("/admin/analytics")
    assert response.status_code == 401
