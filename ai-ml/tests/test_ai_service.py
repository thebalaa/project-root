"""
test_ai_service.py

Integration tests for the main AI service endpoints.
"""

import pytest
from flask import Flask
from microservices.ai_service import app as ai_app

@pytest.fixture
def client():
    with ai_app.test_client() as client:
        yield client

def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json["status"] == "ok"

def test_predict_endpoint(client):
    response = client.post("/predict", json={"input": "test data"})
    assert response.status_code == 200
    assert "predictions" in response.json
