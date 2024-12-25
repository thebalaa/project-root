# microservices/utils/postprocessor.py
from .logger import get_logger

logger = get_logger(__name__)

class Postprocessor:
    """
    Postprocessor for refining and cleaning model output,
    removing any extraneous or sensitive content before returning to the user.
    """

    def refine_output(self, output: str) -> str:
        logger.debug("Refining model output.")
        # Example: remove disclaimers or system prompts
        if "LLM error" in output:
            return "Sorry, I'm experiencing some issues right now."
        # Additional transformations or anonymization if needed
        return output.strip()
