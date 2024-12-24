"""
Test suite for AI microservice core endpoints or functionality.
Uses Pytest to verify that the AI service meets system requirements.
"""

import pytest
import requests

@pytest.fixture
def base_url():
    # Adjust to your AI service endpoint
    return "http://localhost:5000"

def test_ai_service_health(base_url):
    """
    Verify that the AI service health endpoint returns 200 OK.
    """
    response = requests.get(f"{base_url}/health")
    assert response.status_code == 200, "AI service not healthy"
    assert "status" in response.json(), "No status key in health response"
