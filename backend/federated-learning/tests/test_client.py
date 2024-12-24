"""
test_client.py

Unit tests / integration tests for client functionalities.
"""

import pytest
from client.client_app import app as client_app

@pytest.fixture
def client():
    with client_app.test_client() as client:
        yield client

def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert "client" in resp.json["status"]

def test_train_endpoint(client):
    resp = client.post("/train")
    assert resp.status_code == 200
    assert "Local training completed" in resp.json["message"]
