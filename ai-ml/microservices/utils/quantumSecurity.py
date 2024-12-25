# quantumSecurity.py

"""
quantumSecurity.py

Provides functions for post-quantum encryption and decryption.
"""

from typing import List
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.backends import default_backend
import binascii

from .logger import get_logger
from .errorHandler import AppError

logger = get_logger(__name__)

def encrypt_with_pq_public_key(symmetric_key: bytes, public_key_pem: str) -> bytes:
    """
    Encrypts the symmetric key using a member's post-quantum public key.

    Args:
        symmetric_key: AES symmetric key bytes.
        public_key_pem: PEM-encoded public key.

    Returns:
        Encrypted symmetric key bytes.
    """
    try:
        public_key = serialization.load_pem_public_key(public_key_pem.encode('utf-8'), backend=default_backend())
        encrypted_key = public_key.encrypt(
            symmetric_key,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        logger.debug("Symmetric key encrypted with post-quantum public key.")
        return encrypted_key
    except Exception as e:
        logger.error(f"Failed to encrypt symmetric key with public key: {e}")
        raise AppError("Post-quantum encryption failed") from e

def decrypt_with_pq_private_key(encrypted_key: bytes, private_key_pem: str) -> bytes:
    """
    Decrypts the symmetric key using the member's post-quantum private key.

    Args:
        encrypted_key: Encrypted symmetric key bytes.
        private_key_pem: PEM-encoded private key.

    Returns:
        Decrypted symmetric key bytes.
    """
    try:
        private_key = serialization.load_pem_private_key(private_key_pem.encode('utf-8'), password=None, backend=default_backend())
        symmetric_key = private_key.decrypt(
            encrypted_key,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        logger.debug("Symmetric key decrypted with post-quantum private key.")
        return symmetric_key
    except Exception as e:
        logger.error(f"Failed to decrypt symmetric key with private key: {e}")
        raise AppError("Post-quantum decryption failed") from e
