"""
fl_protocols.py

Implements various federated learning protocols (e.g., FedAvg).
"""

import numpy as np
import logging

class FedAvgProtocol:
    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
        self.updates = []  # list of tuples (weights, num_samples)

    def collect_update(self, weights, num_samples):
        """
        Append weights and sample counts to the buffer.
        """
        self.updates.append((weights, num_samples))

    def aggregate(self, strategy="weighted_average"):
        """
        Aggregates the collected updates using the specified strategy.
        Default is Weighted Average (FedAvg).
        """
        if strategy == "weighted_average":
            return self._fed_avg()
        # Other strategies could be implemented here
        return None

    def _fed_avg(self):
        """
        Weighted average of all model updates.
        """
        if not self.updates:
            self.logger.warning("No updates to aggregate.")
            return None

        total_samples = sum(num for _, num in self.updates)
        # Assume weights is dict of layer_name -> weight_array
        aggregate = None
        for weights, num_samples in self.updates:
            if aggregate is None:
                aggregate = {k: (v * num_samples) for k, v in weights.items()}
            else:
                for k in aggregate:
                    aggregate[k] += (weights[k] * num_samples)

        # Divide each sum by total samples
        for k in aggregate:
            aggregate[k] = aggregate[k] / total_samples

        return aggregate

    def clear_updates(self):
        self.updates.clear()
