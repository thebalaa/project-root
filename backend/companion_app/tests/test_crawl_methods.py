import sys
import os
import json
import asyncio
from pprint import pprint
from typing import Dict, List, Optional

# Add the backend directory to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(os.path.dirname(current_dir))
sys.path.append(backend_dir)

from companion_app.crawl4ai_client import (
    AsyncWebCrawler,
    JsonCssExtractionStrategy,
    LLMExtractionStrategy,
    CosineStrategy,
    get_dog_health_schema,
    dog_health_schema
)
from companion_app.config import OPENAI_API_KEY
from crawl4ai import BrowserConfig, CrawlerRunConfig, CacheMode

async def preprocess_with_cosine(crawler: AsyncWebCrawler, url: str) -> Optional[Dict]:
    """
    Preprocess the content using Cosine Strategy to identify relevant health-related sections.
    """
    print("\n=== Cosine Preprocessing Step ===")
    
    try:
        # Define a more focused semantic filter for dog health content
        semantic_filter = (
            "french bulldog health medical condition disease symptoms treatment "
            "genetic health issues breathing problems allergies skin care diet nutrition "
            "veterinary care health concerns common problems medical conditions"
        )
        
        # Configure the cosine strategy with more lenient parameters
        cosine_strategy = CosineStrategy(
            semantic_filter=semantic_filter,
            word_count_threshold=20,        # Lower threshold to catch more content
            sim_threshold=0.3,              # More lenient similarity threshold
            max_dist=0.7,                   # Increased to allow more diverse content
            linkage_method='average',       # Changed to average for better clustering
            top_k=10,                       # Increased number of clusters
            model_name='sentence-transformers/all-MiniLM-L6-v2',  # Faster model
            verbose=True
        )
        
        # Create crawler config
        cosine_config = CrawlerRunConfig(
            extraction_strategy=cosine_strategy,
            cache_mode=CacheMode.BYPASS
        )
        
        print("\nStarting Cosine extraction with parameters:")
        print(f"Word count threshold: {cosine_strategy.word_count_threshold}")
        print(f"Similarity threshold: {cosine_strategy.sim_threshold}")
        print(f"Max distance: {cosine_strategy.max_dist}")
        print(f"Top K clusters: {cosine_strategy.top_k}")
        
        # First get the raw content
        base_result = await crawler.arun(url=url, cache_mode=CacheMode.BYPASS)
        if not base_result.success:
            print(f"Failed to fetch base content: {base_result.error_message}")
            return None
            
        # Now run cosine strategy
        result = await crawler.arun(
            url=url,
            content=base_result.markdown or base_result.cleaned_html,  # Use markdown if available
            config=cosine_config
        )
        
        if not result.success:
            print(f"Cosine extraction failed: {result.error_message}")
            return None
            
        if not hasattr(result, 'extracted_content'):
            print("No content extracted by Cosine strategy")
            return None
            
        # Process the extracted clusters
        content = result.extracted_content if isinstance(result.extracted_content, list) else \
                 json.loads(result.extracted_content) if isinstance(result.extracted_content, str) else \
                 []
        
        print(f"\nRaw extracted clusters: {len(content)}")
        
        # Process and organize the extracted clusters
        processed_content = {
            "health_clusters": [],
            "metadata": {
                "total_clusters": len(content),
                "total_words": 0,
                "similarity_scores": [],
                "categories": {}
            }
        }
        
        # Health-related categories and keywords
        health_filters = {
            "conditions": "health condition disease illness disorder syndrome problem",
            "symptoms": "symptoms signs manifestations indicators",
            "treatments": "treatment therapy medication surgery prevention care remedy",
            "breed_specific": "breed specific genetic french bulldog frenchie characteristic"
        }
        
        # Process each cluster
        for cluster in content:
            # Handle different cluster formats
            cluster_text = cluster.get('text', '') if isinstance(cluster, dict) else str(cluster)
            similarity_score = cluster.get('similarity_score', 0) if isinstance(cluster, dict) else 0
            
            if not cluster_text or len(cluster_text.split()) < cosine_strategy.word_count_threshold:
                continue
                
            # Calculate relevance to each health category
            category_scores = {}
            for category, keywords in health_filters.items():
                score = calculate_category_relevance(cluster_text, keywords)
                category_scores[category] = score
            
            # Assign to most relevant category if score is high enough
            best_category = max(category_scores.items(), key=lambda x: x[1])
            if best_category[1] > 0.2:  # Lowered threshold for more inclusive categorization
                cluster_info = {
                    "text": cluster_text,
                    "category": best_category[0],
                    "relevance_score": best_category[1],
                    "word_count": len(cluster_text.split()),
                    "similarity_score": similarity_score
                }
                processed_content["health_clusters"].append(cluster_info)
                
                # Update metadata
                processed_content["metadata"]["total_words"] += cluster_info["word_count"]
                processed_content["metadata"]["similarity_scores"].append(similarity_score)
                processed_content["metadata"]["categories"][best_category[0]] = \
                    processed_content["metadata"]["categories"].get(best_category[0], 0) + 1
        
        print("\nCosine Preprocessing Results:")
        print(f"Total clusters found: {len(processed_content['health_clusters'])}")
        print("Category distribution:", processed_content["metadata"]["categories"])
        print(f"Total words processed: {processed_content['metadata']['total_words']}")
        
        if not processed_content["health_clusters"]:
            print("\nWarning: No relevant health clusters found. Raw content sample:")
            print(str(content)[:500] + "..." if content else "No content available")
        
        return processed_content
        
    except Exception as e:
        print(f"Error in Cosine preprocessing: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return None

def calculate_category_relevance(text: str, keywords: str) -> float:
    """Calculate relevance score of text to category keywords."""
    text_words = set(text.lower().split())
    keyword_words = set(keywords.lower().split())
    intersection = text_words.intersection(keyword_words)
    return len(intersection) / len(keyword_words)

async def test_extraction_pipeline(url: str):
    """Test the complete extraction pipeline with Cosine preprocessing and LLM extraction"""
    print("\n=== Starting Extraction Pipeline ===")
    print(f"Testing URL: {url}")
    print(f"OpenAI API Key available: {bool(OPENAI_API_KEY)}")
    
    browser_cfg = BrowserConfig(headless=True)
    
    async with AsyncWebCrawler(config=browser_cfg, verbose=True) as crawler:
        # Step 1: Cosine Preprocessing
        preprocessed_content = await preprocess_with_cosine(crawler, url)
        
        if not preprocessed_content:
            print("Preprocessing failed, stopping pipeline")
            return
            
        input("\nPress Enter to continue to LLM extraction...")
        
        # Step 2: LLM Extraction
        print("\n=== LLM Extraction Step ===")
        
        # Prepare content for LLM
        combined_text = "\n\n".join(
            f"Category: {cluster['category']}\n{cluster['text']}"
            for cluster in preprocessed_content["health_clusters"]
        )
        
        # Configure LLM strategy
        llm_strategy = LLMExtractionStrategy(
            provider="openai/gpt-4o",
            api_token=OPENAI_API_KEY,
            schema=dog_health_schema,
            extraction_type="schema",
            instruction="""
            Analyze the preprocessed health-related content and extract a comprehensive knowledge graph.
            The content is already categorized into health conditions, symptoms, treatments, and breed-specific information.
            Focus on creating accurate entity relationships and maintaining medical terminology.
            """,
            chunk_token_threshold=1400,
            overlap_rate=0.1,
            apply_chunking=True,
            input_format="markdown",
            extra_args={
                "temperature": 0.1,
                "max_tokens": 1500,
                "top_p": 0.95
            },
            verbose=True
        )
        
        # Create crawler config for LLM
        llm_config = CrawlerRunConfig(
            extraction_strategy=llm_strategy,
            cache_mode=CacheMode.BYPASS
        )
        
        try:
            result = await crawler.arun(
                url=url,
                content=combined_text,  # Use preprocessed content
                config=llm_config
            )
            
            print("\nLLM Extraction completed.")
            print(f"Success: {result.success}")
            
            if result.success and hasattr(result, 'extracted_content'):
                print("\nExtracted Knowledge Graph:")
                if isinstance(result.extracted_content, str):
                    try:
                        content = json.loads(result.extracted_content)
                        pprint(content)
                    except json.JSONDecodeError:
                        print("Raw content (not JSON):")
                        print(result.extracted_content)
                else:
                    pprint(result.extracted_content)
                
                print("\nToken Usage:")
                llm_strategy.show_usage()
            
        except Exception as e:
            print(f"\nError during LLM extraction: {str(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")

def run_extraction_pipeline(url: str):
    """Wrapper to run the async test function"""
    asyncio.run(test_extraction_pipeline(url))

if __name__ == "__main__":
    TEST_URL = input("Enter the URL to test (or press Enter for default): ")
    if not TEST_URL:
        TEST_URL = "https://example.com/dog-health"
    
    print("\nStarting extraction pipeline...")
    run_extraction_pipeline(TEST_URL) 