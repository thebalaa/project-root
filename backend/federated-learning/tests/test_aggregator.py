"""
test_aggregator.py

Unit tests / integration tests for aggregator functionalities.
"""

import pytest
from aggregator.aggregator_server import app as aggregator_app

@pytest.fixture
def client():
    with aggregator_app.test_client() as client:
        yield client

def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json["status"] == "aggregator-ok"

def test_aggregate_endpoint(client):
    resp = client.post("/aggregate")
    assert resp.status_code == 200
    assert "Aggregation completed" in resp.json["message"]
