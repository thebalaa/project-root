# logger.py

"""
logger.py

Sets up logging for the AI/ML services.
"""

import logging
import sys
import json

def get_logger(name: str) -> logging.Logger:
    """
    Creates and configures a logger.

    Args:
        name: Name of the logger.

    Returns:
        Configured logger.
    """
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)

    # Clear any existing handlers to avoid duplicates
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JSONLogFormatter())
        logger.addHandler(handler)

    return logger

class JSONLogFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "timestamp": self.formatTime(record, self.datefmt),
        }
        return json.dumps(log_record)
