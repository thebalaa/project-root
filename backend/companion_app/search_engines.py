"""
Search engine module for querying multiple search engines for dog and bulldog health/lifestyle information.
"""
import sys
import os

# Add backend to Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import asyncio
from typing import List, Dict, Optional
import json
from datetime import datetime
from googlesearch import search as google_search
from duckduckgo_search import DDGS
import aiohttp
from bs4 import BeautifulSoup
from pydantic import BaseModel
import logging
import traceback
from dotenv import load_dotenv
import glob
from companion_app.crawl4ai_client import scrape_and_extract

# Load environment variables
load_dotenv()

# Configure logging with more detail
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class SearchResult(BaseModel):
    """Model for search results"""
    url: str
    title: Optional[str] = None
    snippet: Optional[str] = None
    engine: str
    query: str
    rank: int

    @classmethod
    def from_json(cls, data: dict, engine: str, query: str, rank: int) -> 'SearchResult':
        """Create SearchResult from JSON data"""
        return cls(
            url=data.get('url') or data.get('link', ''),
            title=data.get('title') or data.get('name', ''),
            snippet=data.get('snippet') or data.get('body') or data.get('description', ''),
            engine=engine,
            query=query,
            rank=rank
        )

class DogHealthSearcher:
    """Class to handle searching across multiple engines for dog health information"""
    
    def __init__(self):
        self.search_queries = {
            'bulldog_health': [
                'bulldog health tips',
                'bulldog common health issues',
                'bulldog care guide',
                'english bulldog health maintenance'
            ],
            'dog_health': [
                'dog health tips',
                'dog preventive care',
                'dog wellness guide',
                'canine health essentials'
            ],
            'bulldog_lifestyle': [
                'bulldog lifestyle tips',
                'bulldog exercise needs',
                'bulldog diet recommendations',
                'bulldog daily routine'
            ],
            'dog_lifestyle': [
                'dog lifestyle best practices',
                'dog exercise requirements',
                'dog nutrition guide',
                'dog daily care routine'
            ]
        }
        logger.info("Initializing DogHealthSearcher")
        
    def extract_urls_from_html(self, html_content: str) -> List[str]:
        """Extract URLs from HTML content"""
        soup = BeautifulSoup(html_content, 'html.parser')
        return [a.get('href') for a in soup.find_all('a', href=True)]

    async def verify_connection(self, engine: str) -> bool:
        """Verify connection to search engine"""
        try:
            if engine == 'google':
                # Test Google search with a simple query
                next(google_search('test', num=1))
                logger.info("Successfully connected to Google Search")
                return True
            elif engine == 'duckduckgo':
                # Test DuckDuckGo connection
                with DDGS() as ddgs:
                    ddgs.text('test', max_results=1)
                logger.info("Successfully connected to DuckDuckGo")
                return True
        except Exception as e:
            logger.error(f"Failed to connect to {engine}: {str(e)}")
            logger.error(traceback.format_exc())
            return False

    async def search_google(self, query: str, num_results: int = 10) -> List[SearchResult]:
        """Search using Google"""
        logger.info(f"Starting Google search for query: {query}")
        
        if not await self.verify_connection('google'):
            logger.error("Google Search connection failed")
            return []
            
        try:
            results = []
            search_results = list(google_search(query, num=num_results))
            logger.info(f"Found {len(search_results)} Google results")
            
            for i, result in enumerate(search_results):
                try:
                    url = str(result)
                    if not url.startswith(('http://', 'https://')):
                        continue
                        
                    results.append(SearchResult(
                        url=url,
                        engine='google',
                        query=query,
                        rank=i + 1
                    ))
                except Exception as e:
                    logger.error(f"Error processing Google result {i}: {str(e)}")
                    continue

            logger.info(f"Successfully processed {len(results)} Google results")
            return results
        except Exception as e:
            logger.error(f"Error in Google search: {str(e)}")
            logger.error(traceback.format_exc())
            return []

    async def search_duckduckgo(self, query: str, num_results: int = 10) -> List[SearchResult]:
        """Search using DuckDuckGo"""
        logger.info(f"Starting DuckDuckGo search for query: {query}")
        
        if not await self.verify_connection('duckduckgo'):
            logger.error("DuckDuckGo connection failed")
            return []
            
        try:
            results = []
            with DDGS() as ddgs:
                search_results = ddgs.text(query, max_results=num_results)
                logger.info(f"Found DuckDuckGo results")
                
                for i, result in enumerate(search_results):
                    try:
                        if not isinstance(result, dict):
                            logger.warning(f"Unexpected result type: {type(result)}")
                            continue
                            
                        url = result.get('link')
                        if not url or not url.startswith(('http://', 'https://')):
                            continue
                            
                        results.append(SearchResult(
                            url=url,
                            title=result.get('title', ''),
                            snippet=result.get('body', ''),
                            engine='duckduckgo',
                            query=query,
                            rank=i + 1
                        ))
                    except Exception as e:
                        logger.error(f"Error processing DuckDuckGo result {i}: {str(e)}")
                        continue

            logger.info(f"Successfully processed {len(results)} DuckDuckGo results")
            return results
        except Exception as e:
            logger.error(f"Error in DuckDuckGo search: {str(e)}")
            logger.error(traceback.format_exc())
            return []

    async def search_all_engines(self, query: str, num_results: int = 10) -> Dict[str, List[SearchResult]]:
        """Search across all engines for a single query"""
        tasks = [
            self.search_google(query, num_results),
            self.search_duckduckgo(query, num_results)
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out empty results and exceptions
        processed_results = {
            'google': results[0] if not isinstance(results[0], Exception) and results[0] else [],
            'duckduckgo': results[1] if not isinstance(results[1], Exception) and results[1] else []
        }
        
        # Log the number of results found
        for engine, engine_results in processed_results.items():
            logger.info(f"Found {len(engine_results)} results from {engine} for query: {query}")
        
        return processed_results

    async def run_all_searches(self) -> Dict[str, Dict[str, List[SearchResult]]]:
        """Run searches for all queries across all engines"""
        all_results = {}
        
        for category, queries in self.search_queries.items():
            category_results = {}
            for query in queries:
                results = await self.search_all_engines(query)
                category_results[query] = results
            all_results[category] = category_results
            
        return all_results

    def save_results_to_file(self, results: Dict[str, Dict[str, List[SearchResult]]]) -> str:
        """Save search results to a file"""
        # Create results directory if it doesn't exist
        results_dir = os.path.join(os.path.dirname(__file__), 'search_results')
        os.makedirs(results_dir, exist_ok=True)
        
        # Generate filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'dog_health_search_results_{timestamp}.json'
        filepath = os.path.join(results_dir, filename)
        
        # Convert results to dictionary format
        output = {}
        for category, category_results in results.items():
            output[category] = {}
            for query, engine_results in category_results.items():
                output[category][query] = {}
                for engine, results_list in engine_results.items():
                    output[category][query][engine] = [
                        result.dict() for result in results_list
                    ]
        
        # Write to file
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)
        
        return filepath

    async def process_latest_results(self):
        """Process latest search results and create knowledge graphs"""
        # Get latest results file
        results_dir = os.path.join(os.path.dirname(__file__), 'search_results')
        files = glob.glob(os.path.join(results_dir, '*.json'))
        if not files:
            logger.error("No search results files found")
            return
            
        latest_file = max(files, key=os.path.getctime)
        logger.info(f"Processing URLs from {latest_file}")
        
        # Load and extract URLs
        with open(latest_file, 'r') as f:
            data = json.load(f)
            
        urls = set()
        for category in data.values():
            for query in category.values():
                for engine in query.values():
                    for result in engine:
                        if result.get('url'):
                            urls.add(result['url'])
        
        logger.info(f"Found {len(urls)} unique URLs to process")
        
        # Process each URL
        for url in urls:
            try:
                logger.info(f"Processing URL: {url}")
                url_id = await scrape_and_extract(url)
                if url_id:
                    logger.info(f"Successfully processed {url} with ID {url_id}")
                else:
                    logger.error(f"Failed to process {url}")
            except Exception as e:
                logger.error(f"Error processing {url}: {str(e)}")
                continue

async def main():
    """Main function to run searches and save results"""
    searcher = DogHealthSearcher()
    results = await searcher.run_all_searches()
    filepath = searcher.save_results_to_file(results)
    logger.info(f"Search results saved to: {filepath}")
    
    # Process results to create knowledge graphs
    await searcher.process_latest_results()

if __name__ == "__main__":
    asyncio.run(main()) 