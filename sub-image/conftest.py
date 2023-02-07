import http.server
import os
import threading

import pytest


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


class TestServer(http.server.SimpleHTTPRequestHandler):
    __test__ = False

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.dirname(__file__) + "/test_server", **kwargs)
