# ai-ml/microservices/ai_service.py

"""
ai_service.py

Main AI service handling API requests, orchestrating data fetching,
decryption, and processing through ML pipelines.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from .dkg_integration import get_decrypted_data
from .models.ml_pipeline import ML_Pipeline
from .utils.logger import setup_logger

app = Flask(__name__)
CORS(app)

# Initialize logger
logger = setup_logger('ai_service')

# Initialize ML Pipeline
ml_pipeline = ML_Pipeline()

@app.route('/process_data', methods=['POST'])
def process_data():
    """
    API endpoint to process data using ML pipelines.
    Expects a JSON payload with 'data_id'.
    """
    data = request.get_json()
    data_id = data.get('data_id')

    if not data_id:
        logger.error("No data_id provided in the request.")
        return jsonify({'success': False, 'message': 'data_id is required.'}), 400

    logger.info(f"Processing data for data_id: {data_id}")

    # Fetch and decrypt data
    plaintext_data = get_decrypted_data(data_id)
    if not plaintext_data:
        logger.error(f"Failed to retrieve or decrypt data for data_id: {data_id}")
        return jsonify({'success': False, 'message': 'Failed to retrieve or decrypt data.'}), 500

    logger.info(f"Retrieved plaintext data: {plaintext_data}")

    # Process data through ML Pipeline
    try:
        ml_results = ml_pipeline.run(plaintext_data)
        logger.info(f"ML processing completed for data_id: {data_id}")
        return jsonify({'success': True, 'results': ml_results}), 200
    except Exception as e:
        logger.error(f"ML processing failed: {e}")
        return jsonify({'success': False, 'message': 'ML processing failed.'}), 500

@app.route('/federated_learning/start', methods=['POST'])
def start_federated_learning():
    """
    API endpoint to initiate federated learning.
    Expects a JSON payload with necessary parameters.
    """
    data = request.get_json()
    # Extract necessary parameters from the request
    # For demonstration, we'll assume some parameters
    learning_rate = data.get('learning_rate', 0.01)
    epochs = data.get('epochs', 10)

    logger.info(f"Starting federated learning with lr={learning_rate}, epochs={epochs}")

    # Start federated learning process
    try:
        federated_learning = FederatedLearning()
        federated_learning.start(learning_rate=learning_rate, epochs=epochs)
        logger.info("Federated learning initiated successfully.")
        return jsonify({'success': True, 'message': 'Federated learning started.'}), 200
    except Exception as e:
        logger.error(f"Failed to start federated learning: {e}")
        return jsonify({'success': False, 'message': 'Failed to start federated learning.'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
