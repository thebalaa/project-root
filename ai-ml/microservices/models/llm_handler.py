# microservices/models/llm_handler.py
import os
import yaml
import openai
from typing import Tuple
from ..utils.logger import get_logger

logger = get_logger(__name__)

class LLMHandler:
    """
    Abstract layer for interacting with LLMs. 
    Currently implemented using the OpenAI API as an example.
    """

    def __init__(self, config_path="config/ai_config.yaml"):
        self.config = self.load_config(config_path)
        openai.api_key = os.getenv("OPENAI_API_KEY", "YOUR_KEY")
        self.model_name = "gpt-3.5-turbo"

    def load_config(self, config_path):
        with open(config_path, "r") as f:
            return yaml.safe_load(f)

    def infer(self, user_input: str, knowledge: str) -> Tuple[str, dict]:
        """
        Combine the user input with knowledge (from vector store or symbolic reasoning)
        and generate a response from the LLM.
        Return the generated text and metadata for debugging or logging.
        """
        prompt = f"""
        You are a privacy-preserving AI. You have additional context:
        {knowledge}

        Question:
        {user_input}
        """

        logger.debug(f"Sending prompt to LLM: {prompt[:200]}...")  # Limit log length
        try:
            response = openai.ChatCompletion.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=800
            )
            answer = response.choices[0].message["content"].strip()
            return answer, {"prompt_tokens": response.usage["prompt_tokens"], 
                            "completion_tokens": response.usage["completion_tokens"]}
        except Exception as e:
            logger.error(f"Error calling OpenAI: {e}")
            return "LLM error encountered.", {}

