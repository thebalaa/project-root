/**
 * postQuantumCrypto.ts
 * 
 * Temporarily stubbing out the actual PQ crypto calls for development/testing.
 */

import { bufferToHex, hexToBuffer } from '../../utils/common';

// STUB the PQCLibrary
declare const PQCLibrary: {
  generateKyberKeyPair(): { publicKey: Uint8Array; secretKey: Uint8Array };
  encapsulateKyber(publicKey: Uint8Array): { cipherText: Uint8Array; sharedSecret: Uint8Array };
  decapsulateKyber(secretKey: Uint8Array, cipherText: Uint8Array): Uint8Array;
};

export interface PostQuantumKeyPair {
  publicKey: string;
  secretKey: string;
}

/**
 * STUB
 */
export function generatePQKeyPair(): PostQuantumKeyPair {
  // Original logic commented out:
  /*
  const { publicKey, secretKey } = PQCLibrary.generateKyberKeyPair();
  return {
    publicKey: bufferToHex(publicKey),
    secretKey: bufferToHex(secretKey),
  };
  */
  return {
    publicKey: 'FAKE_PQ_PUBLIC_KEY',
    secretKey: 'FAKE_PQ_SECRET_KEY',
  };
}

/**
 * STUB - just returns a dummy cipherText & sharedSecret
 */
export function encapsulatePQ(publicKeyHex: string) {
  // Original:
  /*
  const publicKey = hexToBuffer(publicKeyHex);
  const { cipherText, sharedSecret } = PQCLibrary.encapsulateKyber(publicKey);
  return {
    cipherText: bufferToHex(cipherText),
    sharedSecret: bufferToHex(sharedSecret),
  };
  */
  return {
    cipherText: 'FAKE_PQ_CIPHERTEXT',
    sharedSecret: 'FAKE_PQ_SHAREDSECRET',
  };
}

/**
 * STUB - returns a dummy sharedSecret
 */
export function decapsulatePQ(secretKeyHex: string, cipherTextHex: string) {
  // Original:
  /*
  const secretKey = hexToBuffer(secretKeyHex);
  const cipherText = hexToBuffer(cipherTextHex);
  const sharedSecret = PQCLibrary.decapsulateKyber(secretKey, cipherText);
  return bufferToHex(sharedSecret);
  */
  return 'FAKE_PQ_SHAREDSECRET';
}

export function pqHybridEncrypt(plaintext: string, recipientPubKeyHex: string) {
  // Original logic commented out:
  /*
  const ephemeralKeys = generatePQKeyPair();
  const { cipherText, sharedSecret } = encapsulatePQ(recipientPubKeyHex);
  ...
  */
  return {
    ephemeralPub: 'FAKE_EPHEMERAL_PUB',
    cipherTextPQ: 'FAKE_PQ_CIPHERTEXT',
    encryptedData: 'FAKE_ENCRYPTED_DATA',
  };
}

function pseudoSymmetricEncrypt(plaintext: string, symKeyHex: string): string {
  return btoa(plaintext) + '::STUB_KEY';
}
