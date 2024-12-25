# llm_handler.py

"""
llm_handler.py

Handles interactions with Large Language Models (LLMs) to generate embeddings.
"""

import os
from typing import Any, List
from transformers import AutoTokenizer, AutoModel
import torch
from ..utils.logger import get_logger
from ..utils.errorHandler import AppError

logger = get_logger(__name__)

class LLMHandler:
    def __init__(self, config: dict):
        self.model_name = config.get("llm_model", "sentence-transformers/all-MiniLM-L6-v2")
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = self.load_tokenizer()
        self.model = self.load_model()

    def load_tokenizer(self):
        """
        Loads the tokenizer for the LLM.
        """
        try:
            tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            logger.info(f"Tokenizer loaded for model: {self.model_name}")
            return tokenizer
        except Exception as e:
            logger.error(f"Failed to load tokenizer: {e}")
            raise AppError("LLM tokenizer loading failed") from e

    def load_model(self):
        """
        Loads the LLM model.
        """
        try:
            model = AutoModel.from_pretrained(self.model_name)
            model.to(self.device)
            model.eval()
            logger.info(f"LLM model loaded and moved to {self.device}")
            return model
        except Exception as e:
            logger.error(f"Failed to load LLM model: {e}")
            raise AppError("LLM model loading failed") from e

    def generate_embeddings(self, text: str) -> List[float]:
        """
        Generates embeddings for the given text using the LLM.

        Args:
            text: Input text to generate embeddings for.

        Returns:
            List of floats representing the embedding vector.
        """
        try:
            inputs = self.tokenizer(text, return_tensors="pt", truncation=True, padding=True)
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            with torch.no_grad():
                outputs = self.model(**inputs)
                # Use mean pooling
                embeddings = outputs.last_hidden_state.mean(dim=1).squeeze().cpu().numpy().tolist()
            logger.info("Embeddings generated successfully.")
            return embeddings
        except Exception as e:
            logger.error(f"Failed to generate embeddings: {e}")
            raise AppError("Failed to generate embeddings") from e
