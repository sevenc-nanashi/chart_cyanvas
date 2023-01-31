import http.server
import os
import threading

import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"code": "ok"}


def test_process_bgm(simple_server):
    response = client.post("/convert", json={"url": f"http://localhost:{simple_server.server_port}/bgm.mp3"})
    assert response.status_code == 200
    assert response.json()["code"] == "ok"


class TestServer(http.server.SimpleHTTPRequestHandler):
    __test__ = False

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.dirname(__file__) + "/test_server", **kwargs)


@pytest.fixture()
def simple_server():
    server = http.server.HTTPServer(
        ("127.0.0.1", 0),
        TestServer,
    )
    thread = threading.Thread(target=server.serve_forever)
    thread.start()
    yield server
    server.shutdown()
    thread.join()
