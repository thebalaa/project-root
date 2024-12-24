"""
preprocessor.py

Contains functions to preprocess data before feeding it into the ML pipeline or LLM.
"""

import logging

def clean_text(text: str) -> str:
    """
    Removes unwanted characters, trims whitespace, etc.
    """
    text = text.strip()
    # Additional cleaning logic
    return text

def preprocess_input(data):
    """
    Generic method to handle multiple input modalities.
    """
    logging.info("Preprocessing input data.")
    if isinstance(data, dict) and "text" in data:
        data["text"] = clean_text(data["text"])
    return data
