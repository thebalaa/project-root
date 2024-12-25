# ai-ml/microservices/dkg_integration.py

"""
dkg_integration.py

Handles interactions with the Decentralized Knowledge Graph (DKG).
Includes fetching DataReference, retrieving encrypted data from IPFS,
decrypting symmetric keys, and decrypting data for AI/ML processing.
"""

import requests
import json
from typing import Optional
from .utils.keyManagement import KeyManager
from .utils import logger

# Load configurations
with open('../config/dkg_config.yaml', 'r') as f:
    dkg_config = yaml.safe_load(f)

DKG_API_URL = dkg_config.get('dkg_api_url', 'http://localhost:8000/api')
IPFS_GATEWAY_URL = dkg_config.get('ipfs_gateway_url', 'https://ipfs.io/ipfs/')

# Initialize KeyManager
key_manager = KeyManager()

def fetch_data_reference(data_id: str) -> Optional[dict]:
    """
    Fetches the DataReference from the DKG.

    Args:
        data_id (str): Unique identifier for the data.

    Returns:
        dict: DataReference containing ipfs_hash and encrypted_keys.
    """
    url = f"{DKG_API_URL}/data_reference/{data_id}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data_ref = response.json().get('data_reference')
        logger.info(f"Fetched DataReference for data_id: {data_id}")
        return data_ref
    except requests.RequestException as e:
        logger.error(f"Failed to fetch DataReference: {e}")
        return None

def fetch_encrypted_data(ipfs_hash: str) -> Optional[str]:
    """
    Fetches encrypted data from IPFS.

    Args:
        ipfs_hash (str): IPFS hash of the encrypted data.

    Returns:
        str: Encrypted data in hex format.
    """
    url = f"{IPFS_GATEWAY_URL}{ipfs_hash}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        encrypted_data = response.text
        logger.info(f"Fetched encrypted data from IPFS: {ipfs_hash}")
        return encrypted_data
    except requests.RequestException as e:
        logger.error(f"Failed to fetch encrypted data from IPFS: {e}")
        return None

def decrypt_symmetric_key(encrypted_key_hex: str) -> Optional[bytes]:
    """
    Decrypts the symmetric AES key using the AI's private key.

    Args:
        encrypted_key_hex (str): Hex-encoded encrypted symmetric key.

    Returns:
        bytes: Decrypted symmetric key.
    """
    try:
        symmetric_key = key_manager.decrypt_symmetric_key_for_member(encrypted_key_hex)
        logger.info("Decrypted symmetric key successfully.")
        return symmetric_key
    except Exception as e:
        logger.error(f"Failed to decrypt symmetric key: {e}")
        return None

def decrypt_data(encrypted_data_hex: str, symmetric_key: bytes) -> Optional[str]:
    """
    Decrypts the encrypted data using AES-GCM.

    Args:
        encrypted_data_hex (str): Hex-encoded encrypted data (IV + ciphertext).
        symmetric_key (bytes): AES symmetric key.

    Returns:
        str: Decrypted plaintext data.
    """
    try:
        symmetric_key_hex = symmetric_key.hex()
        plaintext = decrypt_with_aes_gcm(encrypted_data_hex, symmetric_key_hex)
        logger.info("Decrypted data successfully.")
        return plaintext
    except Exception as e:
        logger.error(f"Failed to decrypt data: {e}")
        return None

def get_decrypted_data(data_id: str) -> Optional[str]:
    """
    Retrieves and decrypts data for a given data_id.

    Args:
        data_id (str): Unique identifier for the data.

    Returns:
        str: Decrypted plaintext data.
    """
    data_ref = fetch_data_reference(data_id)
    if not data_ref:
        logger.error("DataReference not found.")
        return None

    ipfs_hash = data_ref.get('ipfsHash')
    encrypted_keys = data_ref.get('encryptedKeys', [])

    # For simplicity, assume AI is a member with member_id 'ai_member'
    ai_member_id = 'ai_member'  # Replace with actual member ID
    encrypted_key_entry = next((ek for ek in encrypted_keys if ek['memberId'] == ai_member_id), None)
    if not encrypted_key_entry:
        logger.error(f"No encrypted symmetric key found for member ID: {ai_member_id}")
        return None

    encrypted_symmetric_key_hex = encrypted_key_entry.get('encryptedKey')
    if not encrypted_symmetric_key_hex:
        logger.error("Encrypted symmetric key is missing.")
        return None

    symmetric_key = decrypt_symmetric_key(encrypted_symmetric_key_hex)
    if not symmetric_key:
        logger.error("Symmetric key decryption failed.")
        return None

    encrypted_data_hex = fetch_encrypted_data(ipfs_hash)
    if not encrypted_data_hex:
        logger.error("Encrypted data fetch failed.")
        return None

    plaintext = decrypt_data(encrypted_data_hex, symmetric_key)
    return plaintext
