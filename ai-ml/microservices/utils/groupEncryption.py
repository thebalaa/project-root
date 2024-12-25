# groupEncryption.py

"""
groupEncryption.py

Handles group-specific encryption tasks using hybrid encryption.

Features:
- Generate group symmetric keys.
- Encrypt data with group symmetric keys.
- Encrypt group symmetric keys with authorized members' public keys.
- Decrypt group symmetric keys.
"""

import os
import binascii
from typing import List, Dict
import requests
import json
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from .quantumSecurity import encrypt_with_pq_public_key, decrypt_with_pq_private_key
from .logger import get_logger
from .errorHandler import AppError

logger = get_logger(__name__)

class GroupEncryption:
    def __init__(self, backend_api_url: str):
        self.backend_api_url = backend_api_url

    @staticmethod
    def generate_group_symmetric_key() -> bytes:
        """
        Generates a 256-bit AES symmetric key.
        """
        return AESGCM.generate_key(bit_length=256)

    @staticmethod
    def encrypt_data_with_symmetric_key(plaintext: str, symmetric_key: bytes) -> str:
        """
        Encrypts plaintext using AES-256-GCM with the provided symmetric key.

        Returns:
            Hex-encoded string containing IV + ciphertext.
        """
        aesgcm = AESGCM(symmetric_key)
        iv = os.urandom(12)  # 96-bit nonce for AES-GCM
        ciphertext = aesgcm.encrypt(iv, plaintext.encode('utf-8'), None)
        encrypted_hex = binascii.hexlify(iv + ciphertext).decode('utf-8')
        logger.debug(f"Data encrypted with symmetric key: {encrypted_hex}")
        return encrypted_hex

    @staticmethod
    def decrypt_data_with_symmetric_key(encrypted_data_hex: str, symmetric_key: bytes) -> str:
        """
        Decrypts data encrypted with AES-256-GCM.

        Args:
            encrypted_data_hex: Hex-encoded string containing IV + ciphertext.
            symmetric_key: AES symmetric key.

        Returns:
            Decrypted plaintext string.
        """
        encrypted_data = binascii.unhexlify(encrypted_data_hex)
        iv = encrypted_data[:12]
        ciphertext = encrypted_data[12:]
        aesgcm = AESGCM(symmetric_key)
        plaintext_bytes = aesgcm.decrypt(iv, ciphertext, None)
        plaintext = plaintext_bytes.decode('utf-8')
        logger.debug("Data decrypted with symmetric key.")
        return plaintext

    def encrypt_symmetric_key_with_public_keys(self, symmetric_key: bytes, public_keys: List[str]) -> List[Dict[str, str]]:
        """
        Encrypts the symmetric key with each authorized member's public key.

        Args:
            symmetric_key: AES symmetric key.
            public_keys: List of PEM-encoded public keys.

        Returns:
            List of dictionaries containing member IDs and encrypted symmetric keys.
        """
        encrypted_keys = []
        for idx, pub_key_pem in enumerate(public_keys):
            encrypted_key = encrypt_with_pq_public_key(symmetric_key, pub_key_pem)
            encrypted_key_hex = binascii.hexlify(encrypted_key).decode('utf-8')
            encrypted_keys.append({
                "member_id": f"member_{idx+1}",
                "encrypted_key": encrypted_key_hex
            })
            logger.debug(f"Symmetric key encrypted for member_{idx+1}: {encrypted_key_hex}")
        return encrypted_keys

    def decrypt_symmetric_key_with_private_key(self, encrypted_key_hex: str, private_key_pem: str) -> bytes:
        """
        Decrypts the symmetric key using the member's private key.

        Args:
            encrypted_key_hex: Hex-encoded encrypted symmetric key.
            private_key_pem: PEM-encoded private key.

        Returns:
            Decrypted symmetric key bytes.
        """
        encrypted_key = binascii.unhexlify(encrypted_key_hex)
        symmetric_key = decrypt_with_pq_private_key(encrypted_key, private_key_pem)
        logger.debug("Symmetric key decrypted with private key.")
        return symmetric_key

    def prepare_encrypted_data_for_storage(self, plaintext_data: str, authorized_members_public_keys: List[str]) -> Dict:
        """
        Prepares encrypted data and encrypted symmetric keys for storage.

        Args:
            plaintext_data: The data to encrypt.
            authorized_members_public_keys: List of PEM-encoded public keys of authorized members.

        Returns:
            Dictionary containing encrypted data and encrypted symmetric keys.
        """
        symmetric_key = self.generate_group_symmetric_key()
        encrypted_data = self.encrypt_data_with_symmetric_key(plaintext_data, symmetric_key)
        encrypted_keys = self.encrypt_symmetric_key_with_public_keys(symmetric_key, authorized_members_public_keys)
        logger.info("Prepared encrypted data and encrypted symmetric keys for storage.")
        return {
            "encrypted_data": encrypted_data,
            "encrypted_keys": encrypted_keys
        }

    def upload_encrypted_data(self, encrypted_data: str) -> str:
        """
        Uploads encrypted data to IPFS via backend API.

        Args:
            encrypted_data: Hex-encoded encrypted data.

        Returns:
            IPFS hash.
        """
        url = f"{self.backend_api_url}/ipfs/upload"
        try:
            response = requests.post(url, json={"data": encrypted_data})
            response.raise_for_status()
            ipfs_hash = response.json()["ipfs_hash"]
            logger.info(f"Encrypted data uploaded to IPFS with hash: {ipfs_hash}")
            return ipfs_hash
        except requests.RequestException as e:
            logger.error(f"Failed to upload data to IPFS: {e}")
            raise AppError("Failed to upload data to IPFS") from e

    def publish_data_reference(self, data_id: str, ipfs_hash: str, encrypted_keys: List[Dict[str, str]]) -> None:
        """
        Publishes the DataReference to the DKG via backend API.

        Args:
            data_id: Unique identifier for the data.
            ipfs_hash: IPFS hash of the encrypted data.
            encrypted_keys: List of encrypted symmetric keys for authorized members.
        """
        url = f"{self.backend_api_url}/dkg/publish_data_reference"
        payload = {
            "data_id": data_id,
            "ipfs_hash": ipfs_hash,
            "encrypted_keys": encrypted_keys
        }

        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            logger.info(f"DataReference published successfully for data_id: {data_id}")
        except requests.RequestException as e:
            logger.error(f"Failed to publish DataReference: {e}")
            raise AppError("Failed to publish DataReference") from e

    def retrieve_decrypted_data(self, data_id: str, member_id: str, member_private_key_pem: str) -> str:
        """
        Retrieves and decrypts data for an authorized member.

        Args:
            data_id: Identifier for the data.
            member_id: Identifier for the requesting member.
            member_private_key_pem: PEM-encoded private key of the member.

        Returns:
            Decrypted plaintext data.
        """
        # Fetch DataReference from DKG via backend API
        url = f"{self.backend_api_url}/dkg/get_data_reference/{data_id}"
        try:
            response = requests.get(url)
            response.raise_for_status()
            data_reference = response.json()
            logger.info(f"DataReference fetched for data_id: {data_id}")
        except requests.RequestException as e:
            logger.error(f"Failed to fetch DataReference from DKG: {e}")
            raise AppError("Failed to fetch DataReference from DKG") from e

        ipfs_hash = data_reference.get("ipfs_hash")
        encrypted_keys = data_reference.get("encrypted_keys", [])

        # Find the encrypted symmetric key for the member
        member_encrypted_key = next((ek["encrypted_key"] for ek in encrypted_keys if ek["member_id"] == member_id), None)
        if not member_encrypted_key:
            logger.error(f"No encrypted symmetric key found for member_id: {member_id}")
            raise AppError("No encrypted symmetric key found for member")

        # Decrypt the symmetric key
        try:
            symmetric_key = self.decrypt_symmetric_key_with_private_key(member_encrypted_key, member_private_key_pem)
        except Exception as e:
            logger.error(f"Failed to decrypt symmetric key: {e}")
            raise AppError("Failed to decrypt symmetric key") from e

        # Fetch encrypted data from IPFS
        ipfs_url = f"{self.backend_api_url}/ipfs/fetch/{ipfs_hash}"
        try:
            ipfs_response = requests.get(ipfs_url)
            ipfs_response.raise_for_status()
            encrypted_data = ipfs_response.json()["data"]
            logger.info(f"Encrypted data fetched from IPFS with hash: {ipfs_hash}")
        except requests.RequestException as e:
            logger.error(f"Failed to fetch encrypted data from IPFS: {e}")
            raise AppError("Failed to fetch encrypted data from IPFS") from e

        # Decrypt data with symmetric key
        try:
            plaintext = self.decrypt_data_with_symmetric_key(encrypted_data, symmetric_key)
            logger.info(f"Data decrypted successfully for data_id: {data_id}")
            return plaintext
        except Exception as e:
            logger.error(f"Failed to decrypt data: {e}")
            raise AppError("Failed to decrypt data") from e
