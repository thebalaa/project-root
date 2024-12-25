# errorHandler.py

"""
errorHandler.py

Defines custom exception classes for the AI/ML services.
"""

from typing import Optional

class AppError(Exception):
    """
    Base class for application-specific exceptions.
    """
    def __init__(self, message: str, status_code: Optional[int] = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code

class EncryptionError(AppError):
    """
    Exception raised for encryption/decryption errors.
    """
    def __init__(self, message: str):
        super().__init__(message, status_code=500)

class DKGError(AppError):
    """
    Exception raised for DKG interaction errors.
    """
    def __init__(self, message: str):
        super().__init__(message, status_code=500)

class IPFSError(AppError):
    """
    Exception raised for IPFS interaction errors.
    """
    def __init__(self, message: str):
        super().__init__(message, status_code=500)

# Add more specific exceptions as needed
