"""
test_llm_handler.py

Validates the LLM handler's functionality.
"""

from microservices.models.llm_handler import LLMHandler

def test_generate_response():
    handler = LLMHandler(api_key="dummy_key", model="gpt-3.5-turbo")
    response = handler.generate_response("Hello, LLM!")
    assert "Hello" in response, "LLM did not respond correctly"
