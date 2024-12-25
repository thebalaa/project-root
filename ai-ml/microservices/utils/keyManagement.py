# ai-ml/microservices/utils/keyManagement.py

"""
keyManagement.py

Handles generation, storage, retrieval, and rotation of encryption keys.
Ensures secure handling of symmetric and asymmetric keys for hybrid encryption.
"""

import os
import json
from typing import Optional
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.exceptions import InvalidSignature

# Define paths for key storage
PRIVATE_KEY_PATH = os.getenv('AI_PRIVATE_KEY_PATH', './keys/private_key.pem')
PUBLIC_KEY_PATH = os.getenv('AI_PUBLIC_KEY_PATH', './keys/public_key.pem')
SYMMETRIC_KEY_PATH = os.getenv('AI_SYMMETRIC_KEY_PATH', './keys/symmetric_key.json')

class KeyManager:
    def __init__(self):
        self.private_key = self.load_private_key()
        self.public_key = self.load_public_key()
        self.symmetric_key = self.load_symmetric_key()

    def generate_asymmetric_keys(self):
        """
        Generates a new RSA key pair and saves them to disk.
        """
        print("Generating new RSA key pair...")
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=4096,
            backend=default_backend()
        )
        public_key = private_key.public_key()

        # Serialize and save private key
        with open(PRIVATE_KEY_PATH, 'wb') as f:
            f.write(private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.TraditionalOpenSSL,
                encryption_algorithm=serialization.NoEncryption()
            ))

        # Serialize and save public key
        with open(PUBLIC_KEY_PATH, 'wb') as f:
            f.write(public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            ))
        print(f"Keys saved to {PRIVATE_KEY_PATH} and {PUBLIC_KEY_PATH}.")

    def load_private_key(self) -> Optional[rsa.RSAPrivateKey]:
        """
        Loads the RSA private key from disk.
        """
        if not os.path.exists(PRIVATE_KEY_PATH):
            print("Private key not found. Generating new keys.")
            self.generate_asymmetric_keys()

        with open(PRIVATE_KEY_PATH, 'rb') as f:
            private_key = serialization.load_pem_private_key(
                f.read(),
                password=None,
                backend=default_backend()
            )
        return private_key

    def load_public_key(self) -> Optional[rsa.RSAPublicKey]:
        """
        Loads the RSA public key from disk.
        """
        if not os.path.exists(PUBLIC_KEY_PATH):
            print("Public key not found. Generating new keys.")
            self.generate_asymmetric_keys()

        with open(PUBLIC_KEY_PATH, 'rb') as f:
            public_key = serialization.load_pem_public_key(
                f.read(),
                backend=default_backend()
            )
        return public_key

    def generate_symmetric_key(self):
        """
        Generates a new AES symmetric key and saves it to disk.
        """
        print("Generating new AES symmetric key...")
        key = os.urandom(32)  # AES-256
        with open(SYMMETRIC_KEY_PATH, 'w') as f:
            json.dump({'symmetric_key': key.hex()}, f)
        print(f"Symmetric key saved to {SYMMETRIC_KEY_PATH}.")

    def load_symmetric_key(self) -> Optional[bytes]:
        """
        Loads the AES symmetric key from disk.
        """
        if not os.path.exists(SYMMETRIC_KEY_PATH):
            print("Symmetric key not found. Generating new symmetric key.")
            self.generate_symmetric_key()

        with open(SYMMETRIC_KEY_PATH, 'r') as f:
            data = json.load(f)
            symmetric_key = bytes.fromhex(data['symmetric_key'])
        return symmetric_key

    def rotate_symmetric_key(self):
        """
        Rotates the AES symmetric key.
        """
        print("Rotating AES symmetric key...")
        self.generate_symmetric_key()
        self.symmetric_key = self.load_symmetric_key()
        print("Symmetric key rotated successfully.")

    def encrypt_symmetric_key_for_member(self, member_public_key_pem: str) -> str:
        """
        Encrypts the symmetric key using the member's public RSA key.

        Args:
            member_public_key_pem (str): PEM-encoded public key of the member.

        Returns:
            str: Base64-encoded encrypted symmetric key.
        """
        member_public_key = serialization.load_pem_public_key(
            member_public_key_pem.encode(),
            backend=default_backend()
        )
        encrypted_key = member_public_key.encrypt(
            self.symmetric_key,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        return encrypted_key.hex()

    def decrypt_symmetric_key_for_member(self, encrypted_symmetric_key_hex: str) -> bytes:
        """
        Decrypts the symmetric key using the AI's private RSA key.

        Args:
            encrypted_symmetric_key_hex (str): Hex-encoded encrypted symmetric key.

        Returns:
            bytes: Decrypted symmetric key.
        """
        encrypted_key = bytes.fromhex(encrypted_symmetric_key_hex)
        decrypted_key = self.private_key.decrypt(
            encrypted_key,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        return decrypted_key

    def sign_data(self, data: bytes) -> str:
        """
        Signs the data using the AI's private RSA key.

        Args:
            data (bytes): Data to sign.

        Returns:
            str: Hex-encoded signature.
        """
        signature = self.private_key.sign(
            data,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        return signature.hex()

    def verify_signature(self, data: bytes, signature_hex: str, member_public_key_pem: str) -> bool:
        """
        Verifies the signature using the member's public RSA key.

        Args:
            data (bytes): Original data.
            signature_hex (str): Hex-encoded signature.
            member_public_key_pem (str): PEM-encoded public key of the member.

        Returns:
            bool: True if signature is valid, False otherwise.
        """
        signature = bytes.fromhex(signature_hex)
        member_public_key = serialization.load_pem_public_key(
            member_public_key_pem.encode(),
            backend=default_backend()
        )
        try:
            member_public_key.verify(
                signature,
                data,
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            return True
        except InvalidSignature:
            return False
