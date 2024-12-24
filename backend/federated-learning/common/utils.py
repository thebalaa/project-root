"""
utils.py

General utility methods to share between aggregator and client,
such as sending weights to aggregator or saving/loading models.
"""

import os
import numpy as np
import pickle
import logging
import requests

logger = logging.getLogger(__name__)

def save_model_weights(weights, save_path, filename="model"):
    """
    Save model weights dict to disk as a pickle file.
    """
    os.makedirs(save_path, exist_ok=True)
    filepath = os.path.join(save_path, f"{filename}.pkl")
    with open(filepath, "wb") as f:
        pickle.dump(weights, f)
    logger.info(f"Saved model weights to {filepath}")

def load_model_weights(save_path, filename="model"):
    """
    Load model weights pickle file from disk.
    """
    filepath = os.path.join(save_path, f"{filename}.pkl")
    if not os.path.exists(filepath):
        logger.warning(f"Model file not found: {filepath}")
        return None
    with open(filepath, "rb") as f:
        weights = pickle.load(f)
    logger.info(f"Loaded model weights from {filepath}")
    return weights

def send_weights(url, data):
    """
    POST model weights to aggregator endpoint.
    """
    try:
        response = requests.post(url, json=data)
        return response.status_code == 200
    except Exception as e:
        logger.error(f"Failed to send weights to aggregator: {e}")
        return False
