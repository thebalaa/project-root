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
    db_insert_cosine,
    db_insert_jsoncss_internal,
    db_insert_llm_internal,
    db_insert_cosine_internal
)
from .config import OPENAI_API_KEY
from .models import KnowledgeGraph

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

def run_scrape_sync(url: str, is_internal: bool = False) -> dict:
    """
    Synchronous wrapper for quick testing or non-async contexts.
    Args:
        url: The URL to scrape
        is_internal: Flag to determine if data should be stored in internal tables only
    """
    return asyncio.run(scrape_url(url, is_internal=is_internal))

async def scrape_and_extract(url: str, use_jsoncss: bool = True,
                             use_llm: bool = True, use_cosine: bool = True,
                             is_internal: bool = False) -> int:
    """
    Performs a multi-step extraction flow for the given URL.
    Args:
        url: The URL to scrape
        use_jsoncss: Whether to use JSON-CSS extraction
        use_llm: Whether to use LLM extraction
        use_cosine: Whether to use Cosine similarity clustering
        is_internal: Flag to determine if data should be stored in internal tables only
    Returns:
        page_id: The ID of the page in the database
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
                confidence_score = calculate_jsoncss_confidence(jsoncss_res)
                metadata = json.dumps({
                    "extraction_timestamp": datetime.now().isoformat(),
                    "content_length": len(jsoncss_res.extracted_content),
                    "schema_version": "1.0",
                    "additional_metrics": {}
                })

                if is_internal:
                    # Store only in internal table
                    db_insert_jsoncss_internal(
                        page_id, 
                        product_schema["name"], 
                        jsoncss_res.extracted_content,
                        confidence_score,
                        metadata
                    )
                else:
                    # Store in both tables for external use
                    db_insert_jsoncss(page_id, product_schema["name"], jsoncss_res.extracted_content)
                    db_insert_jsoncss_internal(
                        page_id, 
                        product_schema["name"], 
                        jsoncss_res.extracted_content,
                        confidence_score,
                        metadata
                    )

        # LLM example
        if use_llm:
            print("Initializing LLM extraction with OpenAI...")
            knowledge_graph_strategy = LLMExtractionStrategy(
                provider="openai/gpt-4o",
                api_token=OPENAI_API_KEY,
                schema=KnowledgeGraph.schema(),
                extraction_type="schema",
                instruction="""
                    Extract entities and their relationships from the content to build a knowledge graph.
                    For each entity, provide a name and description.
                    For each relationship, identify two entities and describe how they are connected.
                """,
                chunk_token_threshold=3000,
                overlap_rate=0.2
            )
            
            try:
                llm_res = await crawler.arun(
                    url=url,
                    extraction_strategy=knowledge_graph_strategy,
                    cache_mode=CacheMode.BYPASS
                )
                print(f"LLM Response: {llm_res}")
                print(f"Extracted Content: {llm_res.extracted_content}")
                print(f"LLM extraction completed. Success: {bool(llm_res.extracted_content)}")
                if llm_res.extracted_content:
                    confidence_score = calculate_llm_confidence(llm_res)
                    metadata = json.dumps({
                        "model_version": "gpt-4",
                        "tokens_used": llm_res.usage.total_tokens if hasattr(llm_res, 'usage') else None,
                        "processing_time": llm_res.processing_time if hasattr(llm_res, 'processing_time') else None,
                        "additional_context": {}
                    })

                    if is_internal:
                        # Store only in internal table
                        db_insert_llm_internal(
                            page_id,
                            "knowledge_graph",
                            llm_res.extracted_content,
                            llm_res.raw_text if hasattr(llm_res, 'raw_text') else None,
                            confidence_score,
                            metadata
                        )
                    else:
                        # Store in both tables for external use
                        db_insert_llm(page_id, "knowledge_graph", llm_res.extracted_content)
                        db_insert_llm_internal(
                            page_id,
                            "knowledge_graph",
                            llm_res.extracted_content,
                            llm_res.raw_text if hasattr(llm_res, 'raw_text') else None,
                            confidence_score,
                            metadata
                        )
            except Exception as e:
                print(f"LLM extraction failed: {str(e)}")
                if not is_internal:
                    error_content = json.dumps([{
                        "error": True,
                        "message": str(e),
                        "error_type": str(type(e))
                    }])
                    db_insert_llm(page_id, "knowledge_graph", error_content)

        # Cosine example
        if use_cosine:
            # Already checking if cleaned_html is present and >= 100 chars...
            if not base_result.cleaned_html or len(base_result.cleaned_html.strip()) < 100:
                print(f"Skipping cosine analysis for {url}: insufficient content")
                return page_id

            # Additionally ensure there's at least two sentences.
            # A simple check might be counting periods or line breaks.
            # For a more robust approach, use NLTK or a similar library to split sentences.
            simple_sentence_count = base_result.cleaned_html.count('.') + base_result.cleaned_html.count('!')
            if simple_sentence_count < 2:
                print(f"Skipping cosine analysis for {url}: only {simple_sentence_count} sentences found.")
                return page_id

            cosine_strategy = CosineStrategy(
                model_name="sentence-transformers/all-MiniLM-L6-v2",
                word_count_threshold=10,
                max_dist=0.3,
                min_sentences=2  # Ensure the library tries to handle at least 2 sentences
            )

            try:
                cos_res = await crawler.arun(url=url,
                                             extraction_strategy=cosine_strategy,
                                             cache_mode=CacheMode.BYPASS)
                if cos_res.extracted_content:
                    confidence_score = calculate_cosine_confidence(cos_res)
                    metadata = json.dumps({
                        "model_name": "sentence-transformers/all-MiniLM-L6-v2",
                        "cluster_count": len(json.loads(cos_res.extracted_content)),
                        "processing_metrics": {}
                    })

                    if is_internal:
                        # Store only in internal table
                        db_insert_cosine_internal(
                            page_id,
                            cos_res.extracted_content,
                            json.dumps(cosine_strategy.__dict__),
                            confidence_score,
                            metadata
                        )
                    else:
                        # Store in both tables for external use
                        db_insert_cosine(page_id, cos_res.extracted_content)
                        db_insert_cosine_internal(
                            page_id,
                            cos_res.extracted_content,
                            json.dumps(cosine_strategy.__dict__),
                            confidence_score,
                            metadata
                        )
            except Exception as e:
                print(f"Error during cosine analysis for {url}: {str(e)}")

    return page_id

def calculate_jsoncss_confidence(result) -> float:
    """Calculate confidence score for JSON-CSS extraction"""
    # Implement confidence calculation logic
    return 1.0  # Placeholder

def calculate_llm_confidence(result) -> float:
    """Calculate confidence score for LLM extraction"""
    # Implement confidence calculation logic
    return 1.0  # Placeholder

def calculate_cosine_confidence(result) -> float:
    """Calculate confidence score for Cosine similarity extraction"""
    # Implement confidence calculation logic
    return 1.0  # Placeholder
