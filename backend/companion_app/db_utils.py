import os
import sqlite3
from datetime import datetime
from typing import Any, Dict, List, Optional
import json
from sentence_transformers import SentenceTransformer

DB_PATH = os.path.join(os.path.dirname(__file__), "local_data.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    """Initialize the database with the new schema."""
    conn = get_connection()
    cur = conn.cursor()

    # Base URL information
    cur.execute("""
    CREATE TABLE IF NOT EXISTS crawled_urls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL UNIQUE,
        last_crawled TEXT,
        site_metadata TEXT,  -- JSON field for site-specific metadata
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Main extractions table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS content_extractions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url_id INTEGER NOT NULL,
        extraction_type TEXT NOT NULL,  -- 'json', 'knowledge_graph', 'cosine'
        raw_content TEXT NOT NULL,      -- Full extraction for LLM input
        processed_content TEXT,         -- JSON formatted for querying
        embedding TEXT,                 -- JSON array for vector embedding
        metadata TEXT,                  -- JSON field for additional context
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        extraction_config TEXT,         -- JSON field for extraction parameters
        FOREIGN KEY(url_id) REFERENCES crawled_urls(id),
        UNIQUE(url_id, extraction_type)
    )
    """)

    # Content chunks for semantic search
    cur.execute("""
    CREATE TABLE IF NOT EXISTS content_chunks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        extraction_id INTEGER NOT NULL,
        chunk_text TEXT NOT NULL,
        chunk_type TEXT,               -- 'entity', 'relationship', 'json_block'
        embedding TEXT,                -- JSON array for vector embedding
        metadata TEXT,                 -- JSON field for chunk-specific metadata
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(extraction_id) REFERENCES content_extractions(id)
    )
    """)

    conn.commit()
    conn.close()

def get_or_create_url(url: str) -> int:
    """Get existing URL ID or create new entry."""
    conn = get_connection()
    cur = conn.cursor()
    
    # Try to get existing URL
    cur.execute("SELECT id FROM crawled_urls WHERE url = ?", (url,))
    result = cur.fetchone()
    
    if result:
        url_id = result[0]
    else:
        # Create new URL entry
        cur.execute("""
        INSERT INTO crawled_urls (url, last_crawled, created_at)
        VALUES (?, ?, ?)
        """, (url, datetime.now().isoformat(), datetime.now().isoformat()))
        url_id = cur.lastrowid
    
    conn.commit()
    conn.close()
    return url_id

def store_extraction(url_id: int, extraction_type: str, content: str,
                    raw_content: str = None, metadata: dict = None) -> None:
    """Store extraction results in database"""
    try:
        conn = get_connection()
        cur = conn.cursor()
        
        # Debug print
        print(f"\nStoring {extraction_type} for URL {url_id}")
        print(f"Content length: {len(content)}")
        if raw_content:
            print(f"Raw content length: {len(raw_content)}")
        
        cur.execute("""
            INSERT INTO content_extractions 
            (url_id, extraction_type, raw_content, processed_content, metadata, created_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
        """, (
            url_id,
            extraction_type,
            raw_content or content,  # Use raw_content if provided
            content,
            json.dumps(metadata or {})
        ))
        
        conn.commit()
        print(f"Successfully stored {extraction_type}")
        
    except Exception as e:
        print(f"Error storing extraction: {str(e)}")
        raise
    finally:
        conn.close()

def store_knowledge_graph_chunks(cur, extraction_id: int, content: Dict, model):
    """Store individual chunks from knowledge graph."""
    try:
        graph_data = json.loads(content) if isinstance(content, str) else content
        
        # Store entities
        for entity in graph_data.get('entities', []):
            chunk_text = f"{entity['name']}: {entity['description']}"
            embedding = model.encode([chunk_text])[0].tolist()
            
            cur.execute("""
            INSERT INTO content_chunks 
            (extraction_id, chunk_text, chunk_type, embedding, metadata)
            VALUES (?, ?, ?, ?, ?)
            """, (
                extraction_id,
                chunk_text,
                'entity',
                json.dumps(embedding),
                json.dumps({'entity_type': entity.get('type')})
            ))
        
        # Store relationships
        for rel in graph_data.get('relationships', []):
            chunk_text = f"{rel['description']} ({rel['relation_type']})"
            embedding = model.encode([chunk_text])[0].tolist()
            
            cur.execute("""
            INSERT INTO content_chunks 
            (extraction_id, chunk_text, chunk_type, embedding, metadata)
            VALUES (?, ?, ?, ?, ?)
            """, (
                extraction_id,
                chunk_text,
                'relationship',
                json.dumps(embedding),
                json.dumps({'relation_type': rel['relation_type']})
            ))
            
    except Exception as e:
        print(f"Error storing knowledge graph chunks: {str(e)}")
        raise

def store_json_chunks(cur, extraction_id: int, content: str, model):
    """Store meaningful chunks from JSON content."""
    try:
        json_data = json.loads(content) if isinstance(content, str) else content
        
        # Process each top-level key as a chunk
        for key, value in json_data.items():
            chunk_text = f"{key}: {json.dumps(value)}"
            embedding = model.encode([chunk_text])[0].tolist()
            
            cur.execute("""
            INSERT INTO content_chunks 
            (extraction_id, chunk_text, chunk_type, embedding, metadata)
            VALUES (?, ?, ?, ?, ?)
            """, (
                extraction_id,
                chunk_text,
                'json_block',
                json.dumps(embedding),
                json.dumps({'key': key})
            ))
            
    except Exception as e:
        print(f"Error storing JSON chunks: {str(e)}")
        raise
