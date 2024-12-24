"""
test_common.py

Tests for common modules (data_loader, fl_protocols, model, utils).
"""

import pytest
from federated_learning.common.data_loader import LocalDataset
from federated_learning.common.fl_protocols import FedAvgProtocol
from federated_learning.common.model import FederatedModel
from federated_learning.common.utils import save_model_weights, load_model_weights

def test_local_dataset():
    dataset = LocalDataset("./fake_path")
    assert dataset.size() == 100, "Default shape for dummy data is incorrect"

def test_fedavg_protocol():
    protocol = FedAvgProtocol()
    protocol.collect_update({"layer1": 1}, 10)
    protocol.collect_update({"layer1": 3}, 30)
    result = protocol.aggregate("weighted_average")
    assert result["layer1"] == 2.5, "Weighted average logic error"

def test_federated_model():
    model = FederatedModel("TestModel")
    initial_weights = model.get_weights()
    assert isinstance(initial_weights, dict), "Model weights should be a dict"

def test_model_utils(tmp_path):
    # Save & load test
    weights = {"layer1": 42}
    save_model_weights(weights, str(tmp_path))
    loaded = load_model_weights(str(tmp_path))
    assert loaded["layer1"] == 42, "Failed to load saved model weights"
