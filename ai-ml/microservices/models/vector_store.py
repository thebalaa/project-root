# microservices/models/vector_store.py
from typing import Any
from ..utils.logger import get_logger

logger = get_logger(__name__)

class VectorStore:
    """
    Manages the storage and retrieval of embeddings for semantic search or contextual retrieval.
    """

    def __init__(self):
        # Connect to Pinecone, Weaviate, or FAISS locally. 
        # For now, store embeddings in memory.
        self.embeddings = {}

    def ingest(self, key: str, data: dict):
        """
        Convert the data to embeddings and store them with an identifier.
        This example is simplified. 
        """
        logger.debug(f"Ingesting data into vector store for key={key}")
        text_data = data.get("text", "")
        # Pretend we convert text_data to an embedding vector
        embedding = self.fake_embedding_function(text_data)
        self.embeddings[key] = embedding

    def query(self, query_text: str) -> Any:
        """
        Return the best match from the stored embeddings.
        In real usage, you'd do a similarity search with a vector DB.
        """
        logger.debug(f"Querying vector store for text: {query_text}")
        query_vec = self.fake_embedding_function(query_text)
        best_key, best_score = None, float("inf")
        for k, emb in self.embeddings.items():
            score = self.similarity(query_vec, emb)
            if score < best_score:
                best_score = score
                best_key = k
        return best_key

    def fake_embedding_function(self, text: str):
        # Stub method. In reality, use a transformer or other model to create embeddings.
        return [ord(c) for c in text]  # naive approach

    def similarity(self, v1, v2):
        # e.g., Minkowski or Cosine distance
        # For demonstration: simple sum of absolute differences
        length = min(len(v1), len(v2))
        return sum(abs(a - b) for a, b in zip(v1[:length], v2[:length]))
