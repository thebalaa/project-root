import sqlite3
from pprint import pprint
import os
import sys

# Handle both direct script execution and module import
try:
    from .db_utils import get_connection
except ImportError:
    # When running directly as a script
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from companion_app.db_utils import get_connection

def view_latest_scrape():
    """View the most recent scrape with all its extractions"""
    conn = get_connection()
    cur = conn.cursor()
    
    # Get the most recent page
    cur.execute("""
        SELECT id, url, created_at, status_code 
        FROM pages 
        ORDER BY id DESC 
        LIMIT 1
    """)
    page = cur.fetchone()
    if not page:
        print("No pages found in database")
        return
    
    page_id, url, created_at, status_code = page
    print(f"\n=== Latest Scrape ===")
    print(f"Page ID: {page_id}")
    print(f"URL: {url}")
    print(f"Created: {created_at}")
    print(f"Status: {status_code}")
    
    # Get JSON-CSS extractions
    cur.execute("SELECT schema_name, extracted_data FROM extractions_jsoncss WHERE page_id = ?", (page_id,))
    jsoncss = cur.fetchall()
    if jsoncss:
        print("\n=== JSON-CSS Extractions ===")
        for schema, data in jsoncss:
            print(f"\nSchema: {schema}")
            pprint(data)
    
    # Get LLM extractions
    cur.execute("SELECT strategy_type, extracted_content FROM extractions_llm WHERE page_id = ?", (page_id,))
    llm = cur.fetchall()
    if llm:
        print("\n=== LLM Extractions ===")
        for strategy, content in llm:
            print(f"\nStrategy: {strategy}")
            pprint(content)
    
    # Get Cosine extractions
    cur.execute("SELECT cluster_data FROM extractions_cosine WHERE page_id = ?", (page_id,))
    cosine = cur.fetchall()
    if cosine:
        print("\n=== Cosine Similarity Clusters ===")
        for (data,) in cosine:
            pprint(data)
    
    conn.close()

if __name__ == "__main__":
    view_latest_scrape() 