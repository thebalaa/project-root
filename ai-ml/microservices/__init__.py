# __init__.py

"""
__init__.py

Initializes the microservices package.
"""

from .ai_service import app as ai_service_app
from .federated_learning import FederatedLearning
from .dkg_integration import DKGIntegration

__all__ = ['ai_service_app', 'FederatedLearning', 'DKGIntegration']
