"""
data_loader.py

Defines methods/classes to handle local or distributed data.
"""

import os
import numpy as np

class LocalDataset:
    def __init__(self, data_path):
        self.data_path = data_path
        # Placeholder: load data from the specified path
        self._data = self._load_data()

    def _load_data(self):
        # In a real scenario, you might read from CSV, images, etc.
        # For now, just return random data
        if not os.path.exists(self.data_path):
            return np.zeros((100, 10))  # placeholder
        return np.random.rand(100, 10)

    def size(self):
        return len(self._data)

    def get_data(self):
        return self._data
