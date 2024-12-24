"""
test_postprocessor.py
"""

from microservices.utils.postprocessor import format_results

def test_format_results():
    data = {"some": "results"}
    formatted = format_results(data)
    assert formatted["status"] == "success"
    assert formatted["data"] == data
