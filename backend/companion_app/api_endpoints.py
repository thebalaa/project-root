from typing import Dict, List, Optional, Union
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field, HttpUrl
import sqlite3
import json
from datetime import datetime
import sys
import os
from .crawl4ai_client import scrape_and_extract, AsyncWebCrawler
import asyncio

# Add the project root to Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from companion_app.db_utils import get_connection
from companion_app.models import KnowledgeGraph, Entity, Relationship

app = FastAPI(
    title="Knowledge Graph API",
    description="API endpoints for retrieving knowledge graphs from the database",
    version="1.0.0"
)

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "Knowledge Graph API",
        "version": "1.0.0",
        "endpoints": {
            "latest": "/latest-graph",
            "test": "/test-knowledge-graph",
            "health": "/health"
        }
    }

@app.get("/latest-graph")
async def get_latest_knowledge_graph():
    """Get the most recent knowledge graph from the extractions_llm table"""
    try:
        conn = get_connection()
        cur = conn.cursor()
        
        # Debug: Print available tables
        cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cur.fetchall()
        print("\nAvailable tables:", tables)
        
        # Get the latest knowledge graph extraction with raw content
        cur.execute("""
            SELECT e.extracted_content, e.raw_content, e.created_at, p.url
            FROM extractions_llm e
            JOIN pages p ON e.page_id = p.id
            WHERE e.strategy_type = 'dog_health_knowledge_graph'
            ORDER BY e.created_at DESC
            LIMIT 1
        """)
        
        result = cur.fetchone()
        if not result:
            print("\nNo results found in database")
            test_response = await get_test_knowledge_graph()
            return test_response
            
        extracted_content, raw_content, created_at, url = result
        
        try:
            # Debug prints
            print("\nExtracted content:", extracted_content)
            print("\nRaw content:", raw_content)
            
            # Parse the knowledge graph content
            if isinstance(extracted_content, str):
                kg_data = json.loads(extracted_content)
            else:
                kg_data = extracted_content
                
            print("\nParsed knowledge graph data:", json.dumps(kg_data, indent=2))
            
            # Create knowledge graph instance
            knowledge_graph = KnowledgeGraph(
                entities=[Entity(**e) for e in kg_data.get("entities", [])],
                relationships=[Relationship(**r) for r in kg_data.get("relationships", [])]
            )
            
            response = KnowledgeGraphResponse(
                url=url,
                knowledge_graph=knowledge_graph,
                raw_content=raw_content or "No raw content available",  # Ensure raw_content is never None
                metadata={"source": "database"},
                extraction_timestamp=created_at,
                source_authority=1.0,
                context={
                    "source": "extractions_llm",
                    "extraction_type": "dog_health_knowledge_graph",
                    "url": url
                }
            )
            
            print("\nFinal response:", response)
            return response
            
        except json.JSONDecodeError as e:
            print(f"\nJSON Decode Error: {e}")
            print(f"Content: {extracted_content}")
            raise HTTPException(
                status_code=500,
                detail=f"Error parsing knowledge graph data: {str(e)}"
            )
            
    except Exception as e:
        print(f"\nError in get_latest_knowledge_graph: {e}")
        print(f"Tables in database: {tables}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving latest knowledge graph: {str(e)}"
        )
    finally:
        conn.close()

@app.get("/health")
async def health_check():
    """Basic health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Keep the test endpoint for fallback
@app.get("/test-knowledge-graph")
async def get_test_knowledge_graph():
    """Test endpoint that returns a sample knowledge graph"""
    test_graph = KnowledgeGraph(
        entities=[
            Entity(
                name="Dog",
                type="animal",
                description="A domesticated carnivorous mammal",
                urls=["https://example.com/dogs"],
                metadata={"category": "pets"}
            ),
            Entity(
                name="Veterinarian",
                type="profession",
                description="A medical professional who treats animals",
                urls=["https://example.com/vets"],
                metadata={"category": "healthcare"}
            )
        ],
        relationships=[
            Relationship(
                source="Dog",
                target="Veterinarian",
                relation_type="receives_care_from",
                description="Dogs receive medical care from veterinarians",
                urls=["https://example.com/vet-care"],
                metadata={"importance": "high"},
                entity1="Dog",
                entity2="Veterinarian"
            )
        ]
    )
    
    return KnowledgeGraphResponse(
        url="https://example.com/test",
        knowledge_graph=test_graph,
        raw_content="This is a test knowledge graph about dogs and veterinarians.",  # Added raw_content
        metadata={"test": True},
        extraction_timestamp=datetime.now().isoformat(),
        source_authority=1.0,
        context={"test_data": True}
    )

class KnowledgeGraphResponse(BaseModel):
    """Response model for knowledge graph data"""
    url: str
    knowledge_graph: KnowledgeGraph
    raw_content: str  # Add raw_content field
    metadata: Dict
    extraction_timestamp: str
    source_authority: float
    context: Optional[Dict] = Field(default_factory=dict)

class QueryParams(BaseModel):
    """Query parameters for knowledge graph retrieval"""
    url_filter: Optional[str] = None
    entity_types: Optional[List[str]] = None
    min_authority: Optional[float] = 0.0
    include_raw: bool = False
    max_age_hours: Optional[int] = None

class ScrapeRequest(BaseModel):
    url: str

@app.post("/scrape")
async def scrape_url(request: ScrapeRequest):
    """Scrape and extract knowledge graph from a URL"""
    try:
        print(f"\nReceived scrape request for URL: {request.url}")
        
        # Initialize crawler and process URL
        url_id = await scrape_and_extract(
            url=request.url,
            use_jsoncss=True,
            use_llm=True,
            use_cosine=True
        )
        
        print(f"Scraping completed. URL ID: {url_id}")
        
        return {
            "status": "success",
            "url_id": url_id,
            "message": "Scraping and extraction completed"
        }
        
    except Exception as e:
        print(f"Error in scrape_url endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error scraping URL: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 