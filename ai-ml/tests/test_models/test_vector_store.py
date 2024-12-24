"""
test_vector_store.py
"""

from microservices.models.vector_store import VectorStore

def test_vector_operations():
    store = VectorStore()
    upsert_success = store.upsert_vector("vec1", [0.1, 0.2, 0.3])
    assert upsert_success, "Failed to upsert vector"

    query_result = store.query_vector([0.1, 0.2, 0.3])
    assert "similar_vectors" in query_result
