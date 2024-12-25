# microservices/utils/preprocessor.py
import re
from .logger import get_logger

logger = get_logger(__name__)

class Preprocessor:
    """
    Preprocessor responsible for cleaning and normalizing text.
    """

    def clean_text(self, text: str) -> str:
        logger.debug("Cleaning text data.")
        # Example of simple transformations:
        text = text.lower()
        text = re.sub(r'[^a-z0-9\s]+', '', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text
