# microservices/federated_learning.py
import torch
import torch.nn as nn
import torch.optim as optim
from typing import Dict, Any
from .utils.logger import get_logger

logger = get_logger(__name__)

class FederatedLearningServer:
    """
    Coordinates the aggregation of locally trained model updates from participants.
    Ensures raw user data never leaves their device or node.
    """

    def __init__(self, model_cls, config: Dict[str, Any]):
        """
        model_cls: a callable that returns a new instance of the model
        config: dictionary with relevant FL hyperparameters
        """
        self.model = model_cls()
        self.config = config
        self.global_round = 0

    def aggregate_updates(self, updates: list):
        """
        A simplistic approach to FedAvg or similar aggregator logic.
        `updates` is a list of state_dicts from different participants.
        """
        logger.info("Aggregating local model updates.")
        global_dict = self.model.state_dict()
        for k in global_dict.keys():
            global_dict[k] = sum(u[k] for u in updates) / len(updates)
        self.model.load_state_dict(global_dict)
        self.global_round += 1

    def get_global_model(self):
        """
        Return the current global model state for participants to download.
        """
        return self.model.state_dict()

class FederatedLearningClient:
    """
    Emulates how a participant would train locally on anonymized data
    and then submit only gradient updates or model weights.
    """

    def __init__(self, model_cls, local_data, config: Dict[str, Any]):
        self.model = model_cls()
        self.local_data = local_data
        self.config = config

    def train_local(self):
        """
        Perform local training on anonymized data. Return updated model weights.
        """
        logger.info("Starting local training on anonymized data.")
        criterion = nn.CrossEntropyLoss()
        optimizer = optim.SGD(self.model.parameters(), lr=self.config.get('lr', 0.01))

        # Example training loop
        for epoch in range(self.config.get('local_epochs', 1)):
            for (x, y) in self.local_data:  # Suppose local_data is iterable (DataLoader)
                optimizer.zero_grad()
                outputs = self.model(x)
                loss = criterion(outputs, y)
                loss.backward()
                optimizer.step()
        return self.model.state_dict()
