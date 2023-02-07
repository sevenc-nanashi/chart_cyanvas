import pytest
from httpx import AsyncClient

from main import app


@pytest.mark.asyncio
async def test_read_main():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    assert response.json() == {"code": "ok"}


@pytest.mark.parametrize("filename", ["test_h.png", "test_v.png", "test_s.png"])
@pytest.mark.asyncio
@pytest.mark.skip(reason="RuntimeError: Event loop is closed")
async def test_process_cover(simple_server, filename):
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/convert", json={"url": f"http://localhost:{simple_server.server_port}/{filename}", "type": "cover"}
        )
    assert response.status_code == 200
    assert response.json()["code"] == "ok"
