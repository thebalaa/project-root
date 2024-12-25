# microservices/ai_service.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from .utils.logger import get_logger
from .models.ml_pipeline import MLPipeline
from .utils.preprocessor import Preprocessor
from .utils.postprocessor import Postprocessor
from .dkg_integration import DKGIntegration

logger = get_logger(__name__)

app = FastAPI(title="AI Microservice")

# Data models for request/response
class InferenceRequest(BaseModel):
    text: str
    context: list = []

class InferenceResponse(BaseModel):
    answer: str
    metadata: dict

# Initialize pipeline
ml_pipeline = MLPipeline()
preprocessor = Preprocessor()
postprocessor = Postprocessor()
dkg_client = DKGIntegration()

@app.post("/predict", response_model=InferenceResponse)
async def predict(req: InferenceRequest):
    """
    Accepts user input, optionally fetches relevant context from the DKG,
    and returns an AI-driven response.
    """
    try:
        logger.info("Starting prediction request")
        # Preprocess text
        prep_text = preprocessor.clean_text(req.text)

        # Optionally fetch additional context from the DKG
        # (For instance, if needed to build a knowledge-based answer)
        dkg_context = dkg_client.get_relevant_data(req.context)

        # Run pipeline inference
        prediction, meta = ml_pipeline.run_inference(prep_text, dkg_context)

        # Postprocess results if needed
        final_answer = postprocessor.refine_output(prediction)

        logger.info("Returning prediction result")
        return InferenceResponse(answer=final_answer, metadata=meta)
    except Exception as e:
        logger.error(f"Error in /predict endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))
