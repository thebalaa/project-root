# ai-ml/tests/test_utils/test_keyManagement.py

import unittest
import os
import shutil
from ai_ml.microservices.utils.keyManagement import KeyManager

class TestKeyManager(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Setup a temporary directory for keys
        cls.temp_dir = './temp_keys'
        os.makedirs(cls.temp_dir, exist_ok=True)
        os.environ['AI_PRIVATE_KEY_PATH'] = os.path.join(cls.temp_dir, 'private_key.pem')
        os.environ['AI_PUBLIC_KEY_PATH'] = os.path.join(cls.temp_dir, 'public_key.pem')
        os.environ['AI_SYMMETRIC_KEY_PATH'] = os.path.join(cls.temp_dir, 'symmetric_key.json')
        cls.km = KeyManager()

    @classmethod
    def tearDownClass(cls):
        # Remove temporary directory after tests
        shutil.rmtree(cls.temp_dir)

    def test_asymmetric_key_generation(self):
        # Check if keys are generated and files exist
        self.assertIsNotNone(self.km.private_key)
        self.assertIsNotNone(self.km.public_key)
        self.assertTrue(os.path.exists(os.environ['AI_PRIVATE_KEY_PATH']))
        self.assertTrue(os.path.exists(os.environ['AI_PUBLIC_KEY_PATH']))

    def test_symmetric_key_generation(self):
        # Check if symmetric key is generated and stored
        self.assertIsNotNone(self.km.symmetric_key)
        self.assertTrue(os.path.exists(os.environ['AI_SYMMETRIC_KEY_PATH']))

    def test_encrypt_decrypt_symmetric_key(self):
        # Encrypt and then decrypt the symmetric key
        encrypted_key = self.km.encrypt_symmetric_key_for_member(self.get_member_public_key())
        decrypted_key = self.km.decrypt_symmetric_key_for_member(encrypted_key)
        self.assertEqual(decrypted_key, self.km.symmetric_key)

    def test_sign_verify_data(self):
        # Test signing and verifying data
        data = b"Test data for signing."
        signature = self.km.sign_data(data)
        self.assertIsNotNone(signature)
        is_valid = self.km.verify_signature(data, signature, self.get_member_public_key())
        self.assertTrue(is_valid)

    def get_member_public_key(self) -> str:
        """
        Generates a temporary member RSA key pair for testing.

        Returns:
            str: PEM-encoded public key.
        """
        member_private = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
            backend=default_backend()
        )
        member_public = member_private.public_key()
        member_public_pem = member_public.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode()
        return member_public_pem

if __name__ == '__main__':
    unittest.main()
