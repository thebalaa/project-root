# vector_store.py

"""
vector_store.py

Handles storage and retrieval of embedding vectors using a vector database.
"""

import os
import time
from typing import Any, Dict, List
import pinecone
from ..utils.logger import get_logger
from ..utils.errorHandler import AppError
from tenacity import retry, wait_fixed, stop_after_attempt

logger = get_logger(__name__)

class VectorStore:
    def __init__(self, config: dict):
        self.api_key = config.get("vector_store_api_key")
        self.environment = config.get("vector_store_environment", "us-west1-gcp")
        self.index_name = config.get("vector_store_index_name", "ai-ml-index")
        self.dimension = config.get("vector_store_dimension", 384)
        self.index = None
        self.init_pinecone()

    def init_pinecone(self):
        """
        Initializes the Pinecone client and creates an index if it doesn't exist.
        """
        try:
            pinecone.init(api_key=self.api_key, environment=self.environment)
            if self.index_name not in pinecone.list_indexes():
                pinecone.create_index(self.index_name, dimension=self.dimension)
                logger.info(f"Pinecone index '{self.index_name}' created.")
            else:
                logger.info(f"Pinecone index '{self.index_name}' already exists.")
            self.index = pinecone.Index(self.index_name)
        except Exception as e:
            logger.error(f"Failed to initialize Pinecone: {e}")
            raise AppError("Vector store initialization failed") from e

    @retry(wait=wait_fixed(2), stop=stop_after_attempt(3))
    def store(self, data_id: str, embeddings: List[float]) -> None:
        """
        Stores embeddings in the vector database.

        Args:
            data_id: Unique identifier for the data.
            embeddings: Embedding vector.
        """
        try:
            self.index.upsert(
                vectors=[(data_id, embeddings)]
            )
            logger.info(f"Embeddings upserted for data_id: {data_id}")
        except Exception as e:
            logger.error(f"Failed to upsert embeddings, retrying: {e}")
            raise AppError("Failed to upsert embeddings") from e

    def query(self, query_embeddings: List[float], top_k: int = 5) -> List[str]:
        """
        Queries the vector database for similar embeddings.

        Args:
            query_embeddings: Embedding vector to query with.
            top_k: Number of similar results to return.

        Returns:
            List of data IDs with similar embeddings.
        """
        try:
            response = self.index.query(queries=[query_embeddings], top_k=top_k)
            matches = response["matches"][0]
            similar_data_ids = [match["id"] for match in matches]
            logger.info(f"Query returned {len(similar_data_ids)} similar data IDs.")
            return similar_data_ids
        except Exception as e:
            logger.error(f"Failed to query embeddings: {e}")
            raise AppError("Failed to query embeddings") from e

    def delete(self, data_id: str) -> None:
        """
        Deletes a vector from the vector database.

        Args:
            data_id: Unique identifier for the data.
        """
        try:
            self.index.delete(ids=[data_id])
            logger.info(f"Embeddings deleted for data_id: {data_id}")
        except Exception as e:
            logger.error(f"Failed to delete embeddings: {e}")
            raise AppError("Failed to delete embeddings") from e
