import sys
import os
import json
from pprint import pprint

# Add the companion_app directory to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
companion_app_dir = os.path.dirname(current_dir)
sys.path.append(companion_app_dir)

from db_utils import get_connection

def show_table_info():
    """Debug function to show actual table structure"""
    conn = get_connection()
    cur = conn.cursor()
    
    cur.execute("PRAGMA table_info(extractions_llm)")
    columns = cur.fetchall()
    
    print("\n=== Table Structure ===")
    for col in columns:
        print(f"Column: {col[1]}, Type: {col[2]}")
    
    conn.close()

def test_get_multiple_llm_extractions(limit=5):
    """View multiple recent extractions"""
    conn = get_connection()
    cur = conn.cursor()
    
    # First, get all column names to see what's available
    cur.execute("SELECT * FROM extractions_llm LIMIT 1")
    column_names = [description[0] for description in cur.description]
    print("\nAvailable columns:", column_names)
    
    # Use a simpler query first to debug
    cur.execute(f"""
    SELECT id, page_id, created_at 
    FROM extractions_llm 
    ORDER BY created_at DESC 
    LIMIT {limit}
    """)
    
    results = cur.fetchall()
    conn.close()
    
    if results:
        print(f"\n=== Last {limit} LLM Extractions ===")
        for result in results:
            print(f"\nID: {result[0]}")
            print(f"Page ID: {result[1]}")
            print(f"Created: {result[2]}")
    else:
        print("No entries found")

def dump_entire_database():
    """Dump all tables and their contents"""
    conn = get_connection()
    cur = conn.cursor()
    
    # Get all tables
    cur.execute("""
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
    """)
    tables = cur.fetchall()
    
    for table in tables:
        table_name = table[0]
        print(f"\n\n=== Table: {table_name} ===")
        
        # Get column names
        cur.execute(f"PRAGMA table_info({table_name})")
        columns = cur.fetchall()
        column_names = [col[1] for col in columns]
        print("\nColumns:", ", ".join(column_names))
        
        # Get all rows
        cur.execute(f"SELECT * FROM {table_name}")
        rows = cur.fetchall()
        
        print(f"\nEntries ({len(rows)} rows):")
        for row in rows:
            print("\n---")
            for col_name, value in zip(column_names, row):
                # Truncate long values for readability
                if isinstance(value, str) and len(value) > 100:
                    print(f"{col_name}: {value[:100]}...")
                else:
                    print(f"{col_name}: {value}")
    
    conn.close()

if __name__ == "__main__":
    print("=== Database Structure ===")
    show_table_info()
    
    print("\n=== Recent Extractions ===")
    test_get_multiple_llm_extractions(limit=5)
    
    print("\n=== Full Database Dump ===")
    dump_entire_database() 