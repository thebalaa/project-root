# microservices/models/ml_pipeline.py

from typing import Any, Tuple
from .llm_handler import LLMHandler
from .symbolic_reasoning import SymbolicReasoner
from .vector_store import VectorStore
from ..utils.logger import get_logger

logger = get_logger(__name__)

class MLPipeline:
    """
    Orchestrates the entire AI pipeline:
      1. Retrieve or embed data
      2. Possibly do symbolic reasoning
      3. Interact with LLM
    """

    def __init__(self):
        self.llm_handler = LLMHandler()
        self.symbolic_engine = SymbolicReasoner()
        self.vector_store = VectorStore()

    def run_inference(self, user_input: str, context_data: dict) -> Tuple[str, dict]:
        """
        Core method to handle an inference request. 
        1. Possibly ingest context data into vector store
        2. Combine user_input with external knowledge (symbolic or vector-based)
        3. Generate a final answer with the LLM
        """
        logger.debug("Running ML pipeline inference.")

        # 1. Ingest context data into vector store if needed
        for key, content in context_data.items():
            self.vector_store.ingest(key, content)

        # 2. If symbolic reasoning is needed
        knowledge_facts = self.symbolic_engine.process_knowledge(context_data)

        # 3. Query LLM with user input + knowledge
        response_text, llm_metadata = self.llm_handler.infer(user_input, knowledge_facts)
        
        # Return final answer plus any relevant metadata
        return response_text, {"llm_metadata": llm_metadata, "facts_used": knowledge_facts}
