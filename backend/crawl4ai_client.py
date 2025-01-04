# crawl4ai_client.py
import asyncio
from crawl4ai import AsyncWebCrawler, CacheMode
from typing import Optional
import json
from datetime import datetime
from crawl4ai.extraction_strategy import (
    JsonCssExtractionStrategy,
    LLMExtractionStrategy,
    CosineStrategy
)
from .db_utils import (
    db_insert_page,
    db_update_page,
    db_insert_jsoncss,
    db_insert_llm,
    db_insert_cosine
)

async def scrape_url(url: str, verbose: bool = True) -> dict:
    """
    Asynchronously scrape the given URL using Crawl4AI and return relevant data.
    """
    async with AsyncWebCrawler(verbose=verbose) as crawler:
        # For demonstration, we bypass the cache each time.
        result = await crawler.arun(url=url, cache_mode=CacheMode.BYPASS)

        # Build a small dict with relevant info
        return {
            "success": result.success,
            "status_code": result.status_code,
            "error_message": result.error_message,
            "html": result.html if result.success else None,
            "markdown": result.markdown if result.success else None,
            "cleaned_html": result.cleaned_html if result.success else None,
            "links": result.links if result.success else {},
            "media": result.media if result.success else {}
        }

def run_scrape_sync(url: str) -> dict:
    """
    Synchronous wrapper for quick testing or non-async contexts.
    """
    return asyncio.run(scrape_url(url))

async def scrape_and_extract(url: str, use_jsoncss: bool = True,
                             use_llm: bool = True, use_cosine: bool = True) -> int:
    """
    Performs a multi-step extraction flow for the given URL:
    1) Insert/track the page in DB
    2) Crawl (standard crawl)
    3) (Optional) JSON-CSS extraction
    4) (Optional) LLM extraction
    5) (Optional) Cosine similarity clustering
    Returns the page_id in the DB.
    """
    page_id = db_insert_page(url, datetime.now().isoformat())

    async with AsyncWebCrawler(verbose=False) as crawler:
        base_result = await crawler.arun(url=url, cache_mode=CacheMode.BYPASS)
        db_update_page(
            page_id,
            status_code=base_result.status_code or 0,
            error_message=base_result.error_message or "",
            raw_html=base_result.html,
            cleaned_html=base_result.cleaned_html,
            markdown=base_result.markdown
        )

        if not base_result.success:
            print(f"Failed to scrape {url}: {base_result.error_message}")
            return page_id

        # JSON-CSS example
        if use_jsoncss:
            product_schema = {
                "name": "Products",
                "baseSelector": ".product",
                "fields": [
                    {"name": "title", "selector": ".title", "type": "text"},
                    {"name": "price", "selector": ".price", "type": "text"}
                ]
            }
            jsoncss_strategy = JsonCssExtractionStrategy(product_schema)

            jsoncss_res = await crawler.arun(url=url,
                                             extraction_strategy=jsoncss_strategy,
                                             cache_mode=CacheMode.BYPASS)
            if jsoncss_res.extracted_content:
                db_insert_jsoncss(page_id, product_schema["name"], jsoncss_res.extracted_content)

        # LLM example
        if use_llm:
            knowledge_graph_strategy = LLMExtractionStrategy(
                provider="openai/gpt-4",
                schema={"entities": [], "relationships": []},
                extraction_type="schema",
                instruction="Extract key entities and relationships from the text. Provide a JSON structure."
            )
            llm_res = await crawler.arun(url=url,
                                         extraction_strategy=knowledge_graph_strategy,
                                         cache_mode=CacheMode.BYPASS)
            if llm_res.extracted_content:
                db_insert_llm(page_id, "knowledge_graph", llm_res.extracted_content)

        # Cosine example
        if use_cosine:
            cosine_strategy = CosineStrategy(
                model_name="sentence-transformers/all-MiniLM-L6-v2",
                word_count_threshold=10,
                max_dist=0.3
            )
            cos_res = await crawler.arun(url=url,
                                         extraction_strategy=cosine_strategy,
                                         cache_mode=CacheMode.BYPASS)
            if cos_res.extracted_content:
                db_insert_cosine(page_id, cos_res.extracted_content)

    return page_id
