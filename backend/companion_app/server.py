# server.py
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from .crawl4ai_client import scrape_and_extract
from .db_utils import init_db

app = FastAPI(
    title="Local Companion App",
    version="1.0.0"
)

class ScrapeRequest(BaseModel):
    url: str

@app.on_event("startup")
def on_startup():
    # Initialize or migrate DB
    init_db()

@app.post("/scrape")
async def scrape_endpoint(payload: ScrapeRequest):
    url = payload.url
    if not url.startswith("http"):
        raise HTTPException(status_code=400, detail="Invalid URL")

    # Multi-step extraction
    page_id = await scrape_and_extract(url)

    return {
        "page_id": page_id,
        "message": f"Scraping and extraction completed for {url}"
    }

def run():
    uvicorn.run("companion_app.server:app", host="127.0.0.1", port=5000, reload=True)

if __name__ == "__main__":
    run()
