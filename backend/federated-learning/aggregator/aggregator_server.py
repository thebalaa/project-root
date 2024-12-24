"""
aggregator_server.py

Provides the server-side logic for the federated learning aggregator.
Receives updates from federated learning clients, aggregates them,
and broadcasts the aggregated model updates back.
"""

import os
import yaml
import logging
from flask import Flask, request, jsonify

# Import shared modules from 'common' (data_loader, fl_protocols, etc.)
from federated_learning.common.fl_protocols import FedAvgProtocol
from federated_learning.common.model import FederatedModel
from federated_learning.common.utils import load_model_weights, save_model_weights

app = Flask(__name__)
logger = logging.getLogger(__name__)

# Load config from aggregator_config.yaml (or from central config folder)
CONFIG_PATH = os.path.join(os.path.dirname(__file__), "aggregator_config.yaml")
with open(CONFIG_PATH, "r") as f:
    config = yaml.safe_load(f)

AGGREGATOR_PORT = config["aggregator"].get("port", 8000)
AGGREGATION_STRATEGY = config["training"].get("aggregation_strategy", "weighted_average")
SAVE_PATH = config["training"].get("save_path", "./saved_models")
LOG_LEVEL = config["logging"].get("level", "INFO")

logging.basicConfig(level=LOG_LEVEL)


# Global aggregator instance
fed_model = FederatedModel(model_type=config["training"]["model_type"])
protocol = FedAvgProtocol()

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "aggregator-ok"}), 200

@app.route("/update", methods=["POST"])
def receive_update():
    """
    Endpoint to receive local model weights or gradients from a client.
    """
    data = request.get_json()
    client_id = data["client_id"]
    weights = data["model_weights"]
    num_samples = data["num_samples"]

    logger.info(f"Received model update from client: {client_id}")
    protocol.collect_update(weights, num_samples)

    return jsonify({"message": "Update received"}), 200

@app.route("/aggregate", methods=["POST"])
def aggregate_models():
    """
    Perform the aggregation step across all collected updates.
    """
    aggregated_weights = protocol.aggregate(AGGREGATION_STRATEGY)
    # Load aggregated weights into fed_model
    fed_model.set_weights(aggregated_weights)
    # Save model to disk
    save_model_weights(aggregated_weights, SAVE_PATH, "global_model")
    logger.info("Aggregated model saved.")
    # Clear the protocol's buffer
    protocol.clear_updates()
    return jsonify({"message": "Aggregation completed"}), 200

@app.route("/global-model", methods=["GET"])
def get_global_model():
    """
    Return the latest aggregated model weights so clients can sync.
    """
    weights = load_model_weights(SAVE_PATH, "global_model")
    return jsonify({"model_weights": weights}), 200

if __name__ == "__main__":
    logger.info(f"Starting aggregator on port {AGGREGATOR_PORT}")
    app.run(host="0.0.0.0", port=AGGREGATOR_PORT)
