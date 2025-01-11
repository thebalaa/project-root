# server.py
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from companion_app.crawl4ai_client import scrape_and_extract
from .db_utils import init_db
import os
from dotenv import load_dotenv
import litellm

# Load environment variables at startup
load_dotenv()

# Verify OPENAI_API_KEY is available
if not os.getenv("OPENAI_API_KEY"):
    raise EnvironmentError("OPENAI_API_KEY not found in environment variables")

# Enable LiteLLM debugging
litellm.set_verbose = True

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize or migrate DB
    print("Initializing database...")
    init_db()
    print("Database initialized")
    yield
    print("Shutting down...")

app = FastAPI(
    title="Local Companion App",
    version="1.0.0",
    lifespan=lifespan
)

def run():
    """Run the FastAPI server"""
    uvicorn.run(
        "companion_app.api_endpoints:app",
        host="127.0.0.1",
        port=5000,
        reload=True,
        reload_dirs=["backend/companion_app"]
    )
if __name__ == "__main__":
    run()

