# logger.py

"""
logger.py

Sets up logging for the AI/ML services.
"""

import logging
import sys

def get_logger(name: str) -> logging.Logger:
    """
    Creates and configures a logger.

    Args:
        name: Name of the logger.

    Returns:
        Configured logger.
    """
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        # Console handler
        ch = logging.StreamHandler(sys.stdout)
        ch.setLevel(logging.INFO)
        # Formatter
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        ch.setFormatter(formatter)
        # Add handler
        logger.addHandler(ch)
    return logger
