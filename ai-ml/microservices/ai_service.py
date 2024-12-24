"""
ai_service.py

Main entry point for the AI microservice.
Starts a Flask (or FastAPI) app to handle incoming requests.
"""

from flask import Flask, request, jsonify
import os
import logging

from .models.ml_pipeline import MLPipeline
from .models.llm_handler import LLMHandler
from .models.symbolic_reasoning import SymbolicReasoning
from .dkg_integration import DKGIntegration
from .utils.logger import get_logger

app = Flask(__name__)
logger = get_logger(__name__)

# Initialize global objects or load models
ml_pipeline = MLPipeline()
llm_handler = LLMHandler()
symbolic_engine = SymbolicReasoning()
dkg_client = DKGIntegration()

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    logger.info(f"Received data for prediction: {data}")
    predictions = ml_pipeline.predict(data)
    return jsonify({"predictions": predictions})

@app.route("/llm", methods=["POST"])
def call_llm():
    prompt = request.json.get("prompt", "")
    response = llm_handler.generate_response(prompt)
    return jsonify({"response": response})

@app.route("/symbolic", methods=["POST"])
def symbolic():
    facts = request.json.get("facts", [])
    result = symbolic_engine.run_reasoning(facts)
    return jsonify({"result": result})

@app.route("/publish-dkg", methods=["POST"])
def publish_dkg():
    asset_data = request.json
    success = dkg_client.publish_asset(asset_data)
    return jsonify({"published": success})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    logger.info(f"Starting AI service on port {port}")
    app.run(host="0.0.0.0", port=port)
