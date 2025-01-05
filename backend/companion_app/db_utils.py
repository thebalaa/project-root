import os
import sqlite3
from datetime import datetime
from typing import Any, Dict

DB_PATH = os.path.join(os.path.dirname(__file__), "local_data.db")

def get_connection():
    return sqlite3.connect(DB_PATH)

def init_db():
    """Initialize the database tables if they don't exist yet."""
    conn = get_connection()
    cur = conn.cursor()

    # Table: pages
    cur.execute("""
    CREATE TABLE IF NOT EXISTS pages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        title TEXT,
        raw_html TEXT,
        cleaned_html TEXT,
        markdown TEXT,
        status_code INTEGER,
        error_message TEXT,
        created_at TEXT,
        updated_at TEXT
    )
    """)

    # Table: extractions_jsoncss
    cur.execute("""
    CREATE TABLE IF NOT EXISTS extractions_jsoncss (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        page_id INTEGER NOT NULL,
        schema_name TEXT,
        extracted_data TEXT,
        created_at TEXT,
        FOREIGN KEY(page_id) REFERENCES pages(id)
    )
    """)

    # Table: extractions_llm
    cur.execute("""
    CREATE TABLE IF NOT EXISTS extractions_llm (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        page_id INTEGER NOT NULL,
        strategy_type TEXT,
        extracted_content TEXT,
        raw_extraction_text TEXT,
        created_at TEXT,
        FOREIGN KEY(page_id) REFERENCES pages(id)
    )
    """)

    # Table: extractions_cosine
    cur.execute("""
    CREATE TABLE IF NOT EXISTS extractions_cosine (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        page_id INTEGER NOT NULL,
        cluster_data TEXT,
        params TEXT,
        created_at TEXT,
        FOREIGN KEY(page_id) REFERENCES pages(id)
    )
    """)

    conn.commit()
    conn.close()

def db_insert_page(url: str, created_at: str) -> int:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
    INSERT INTO pages (url, created_at) VALUES (?, ?)
    """, (url, created_at))
    page_id = cur.lastrowid
    conn.commit()
    conn.close()
    return page_id

def db_update_page(page_id: int, **kwargs):
    """Update a record in pages with given fields."""
    if not kwargs:
        return
    conn = get_connection()
    cur = conn.cursor()

    # Build dynamic SQL
    columns = []
    values = []
    for col, val in kwargs.items():
        columns.append(f"{col}=?")
        values.append(val)
    set_clause = ", ".join(columns)
    sql = f"UPDATE pages SET {set_clause} WHERE id=?"
    values.append(page_id)
    cur.execute(sql, tuple(values))

    conn.commit()
    conn.close()

def db_insert_jsoncss(page_id: int, schema_name: str, extracted_data: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
    INSERT INTO extractions_jsoncss (page_id, schema_name, extracted_data, created_at)
    VALUES (?, ?, ?, ?)
    """, (page_id, schema_name, extracted_data, datetime.now().isoformat()))
    conn.commit()
    conn.close()

def db_insert_llm(page_id: int, strategy_type: str, extracted_content: str, raw_text: str = None):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
    INSERT INTO extractions_llm (page_id, strategy_type, extracted_content, raw_extraction_text, created_at)
    VALUES (?, ?, ?, ?, ?)
    """, (page_id, strategy_type, extracted_content, raw_text, datetime.now().isoformat()))
    conn.commit()
    conn.close()

def db_insert_cosine(page_id: int, cluster_data: str, params: str = None):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
    INSERT INTO extractions_cosine (page_id, cluster_data, params, created_at)
    VALUES (?, ?, ?, ?)
    """, (page_id, cluster_data, params, datetime.now().isoformat()))
    conn.commit()
    conn.close() 