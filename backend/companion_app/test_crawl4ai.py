import pytest
from fastapi.testclient import TestClient
from .server import app
from .db_utils import get_connection

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    # Initialize or clear DB at start
    # e.g., remove local_data.db or call init_db() forcibly
    pass

def test_scrape_endpoint():
    payload = {"url": "https://example.com"}
    response = client.post("/scrape", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert "page_id" in data
    page_id = data["page_id"]
    print("Scraped page_id =", page_id)

    # Confirm record in DB
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT url FROM pages WHERE id=?", (page_id,))
    row = cur.fetchone()
    conn.close()
    assert row is not None
    assert row[0] == "https://example.com" 