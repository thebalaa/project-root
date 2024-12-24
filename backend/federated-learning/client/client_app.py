"""
client_app.py

Implements a federated learning client that trains locally
and communicates updates to the aggregator.
"""

import os
import yaml
import logging
from flask import Flask, request, jsonify

from federated_learning.common.data_loader import LocalDataset
from federated_learning.common.model import FederatedModel
from federated_learning.common.utils import load_model_weights, send_weights

app = Flask(__name__)
logger = logging.getLogger(__name__)

# Load config
CONFIG_PATH = os.path.join(os.path.dirname(__file__), "client_config.yaml")
with open(CONFIG_PATH, "r") as f:
    config = yaml.safe_load(f)

CLIENT_PORT = config["client"].get("port", 9000)
CLIENT_ID = config["client"].get("client_id", "client_x")
AGGREGATOR_URL = config["aggregator"].get("url", "http://localhost:8000")
DATASET_PATH = config["training"].get("dataset_path", "./data")
LOG_LEVEL = config["logging"].get("level", "INFO")
logging.basicConfig(level=LOG_LEVEL)

# Initialize local model
local_model = FederatedModel(model_type=config["training"]["model_type"])
# Initialize dataset
local_data = LocalDataset(DATASET_PATH)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": f"client-{CLIENT_ID}-ok"}), 200

@app.route("/train", methods=["POST"])
def train_local_model():
    """
    Train the local model using local data.
    """
    # Optionally load the latest global model
    global_model_endpoint = AGGREGATOR_URL + "/global-model"
    latest_weights = load_model_weights_from_aggregator(global_model_endpoint)
    if latest_weights:
        local_model.set_weights(latest_weights)

    epochs = config["training"].get("epochs", 1)
    batch_size = config["training"].get("batch_size", 32)

    logger.info("Starting local training.")
    local_model.train(local_data, batch_size=batch_size, epochs=epochs)
    logger.info("Finished local training.")

    return jsonify({"message": "Local training completed"}), 200

@app.route("/upload", methods=["POST"])
def upload_model_update():
    """
    Sends local model weights to the aggregator.
    """
    model_weights = local_model.get_weights()
    num_samples = local_data.size()

    data = {
        "client_id": CLIENT_ID,
        "model_weights": model_weights,
        "num_samples": num_samples
    }
    success = send_weights(AGGREGATOR_URL + "/update", data)
    if success:
        return jsonify({"message": "Model update uploaded"}), 200
    else:
        return jsonify({"error": "Failed to upload model update"}), 500

def load_model_weights_from_aggregator(url):
    """
    Helper function to fetch global model weights from aggregator
    """
    import requests
    try:
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            return resp.json().get("model_weights", None)
    except Exception as e:
        logger.error(f"Failed to load model from aggregator: {e}")
    return None

if __name__ == "__main__":
    logger.info(f"Starting client on port {CLIENT_PORT}")
    app.run(host="0.0.0.0", port=CLIENT_PORT)
