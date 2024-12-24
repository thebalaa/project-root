"""
test_preprocessor.py
"""

from microservices.utils.preprocessor import preprocess_input

def test_preprocess_input():
    sample_data = {"text": "  Some input text.  "}
    result = preprocess_input(sample_data)
    assert result["text"] == "Some input text.", "Text not cleaned properly"
