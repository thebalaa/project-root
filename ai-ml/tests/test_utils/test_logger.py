"""
test_logger.py

Unit tests for the logger utility.
"""

from microservices.utils.logger import get_logger

def test_get_logger():
    logger = get_logger("test_logger")
    assert logger is not None
    logger.info("Logger test message")
