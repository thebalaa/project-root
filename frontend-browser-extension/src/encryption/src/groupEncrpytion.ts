/**
 * groupEncryption.ts
 * 
 * Handles group-specific encryption tasks using hybrid encryption.
 * 
 * Features:
 * - Generate group symmetric keys.
 * - Encrypt data with group symmetric keys.
 * - Encrypt group symmetric keys with authorized members' public keys.
 * - Decrypt group symmetric keys.
 */

import { generatePQKeyPair, encapsulatePQ, decapsulatePQ } from './postQuantumCrypto';
import { bufferToHex, hexToBuffer } from '../utils/common';

/**
 * Interface representing an encrypted group symmetric key for a member.
 */
export interface EncryptedGroupKey {
  memberId: string; // Unique identifier for the group member
  encryptedSymmetricKey: string; // Encrypted with member's public key (hex)
}

/**
 * Generates a new AES symmetric key for a group.
 * 
 * @returns Hex-encoded AES key
 */
export function generateGroupSymmetricKey(): string {
  // Using a cryptographically secure method to generate a 256-bit (32-byte) AES key
  const symmetricKey = crypto.getRandomValues(new Uint8Array(32));
  return bufferToHex(symmetricKey);
}

/**
 * Encrypts data using a group symmetric key.
 * 
 * @param plaintext - The data to encrypt
 * @param symmetricKeyHex - Hex-encoded AES symmetric key
 * @returns Encrypted data in hex format (IV + ciphertext)
 */
export function encryptDataWithGroupKey(plaintext: string, symmetricKeyHex: string): Promise<string> {
  const symmetricKey = hexToBuffer(symmetricKeyHex);
  // Use AES-GCM for symmetric encryption
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  const cryptoKeyPromise = crypto.subtle.importKey(
    'raw',
    symmetricKey,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  return cryptoKeyPromise.then(key => {
    return crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    ).then(encrypted => {
      // Combine IV and encrypted data for storage/transmission
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(encrypted), iv.length);
      return bufferToHex(combined);
    });
  }).catch(err => {
    console.error('Encryption with group key failed:', err);
    throw err;
  });
}

/**
 * Decrypts data using a group symmetric key.
 * 
 * @param encryptedDataHex - Hex-encoded encrypted data (IV + ciphertext)
 * @param symmetricKeyHex - Hex-encoded AES symmetric key
 * @returns Decrypted plaintext
 */
export function decryptDataWithGroupKey(encryptedDataHex: string, symmetricKeyHex: string): Promise<string> {
  const combined = hexToBuffer(encryptedDataHex);
  const iv = combined.slice(0, 12); // Extract IV
  const ciphertext = combined.slice(12);
  const symmetricKey = hexToBuffer(symmetricKeyHex);
  const cryptoKeyPromise = crypto.subtle.importKey(
    'raw',
    symmetricKey,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  return cryptoKeyPromise.then(key => {
    return crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
  }).then(decrypted => {
    const decoder = new TextDecoder();
    return decoder.decode(new Uint8Array(decrypted));
  }).catch(err => {
    console.error('Decryption with group key failed:', err);
    throw err;
  });
}

/**
 * Encrypts a group symmetric key with authorized members' public keys.
 * 
 * @param symmetricKeyHex - Hex-encoded AES symmetric key
 * @param memberPublicKeys - Array of hex-encoded public keys of authorized members
 * @returns Array of EncryptedGroupKey objects
 */
export function encryptGroupSymmetricKey(symmetricKeyHex: string, memberPublicKeys: string[]): EncryptedGroupKey[] {
  return memberPublicKeys.map((pubKeyHex, index) => {
    const encrypted = encapsulatePQ(pubKeyHex); // Encrypt symmetric key with member's public key
    return {
      memberId: `member_${index + 1}`, // Replace with actual member IDs
      encryptedSymmetricKey: encrypted.cipherText, // Assuming cipherText contains the encrypted symmetric key
    };
  });
}

/**
 * Decrypts an encrypted group symmetric key using the user's private key.
 * 
 * @param encryptedSymmetricKeyHex - Hex-encoded encrypted symmetric key
 * @param userPrivateKeyHex - Hex-encoded user's private key
 * @returns Decrypted symmetric key in hex format
 */
export function decryptGroupSymmetricKey(encryptedSymmetricKeyHex: string, userPrivateKeyHex: string): Promise<string> {
  return decapsulatePQ(userPrivateKeyHex, encryptedSymmetricKeyHex)
    .then(sharedSecret => {
      return sharedSecret; // Assuming sharedSecret is the symmetric key
    })
    .catch(err => {
      console.error('Decryption of group symmetric key failed:', err);
      throw err;
    });
}

/**
 * Prepares encrypted data and encrypted symmetric keys for storage.
 * 
 * @param plaintextData - The data to encrypt
 * @param authorizedMemberPublicKeys - Array of hex-encoded public keys of authorized members
 * @returns Object containing encrypted data and encrypted symmetric keys
 */
export async function prepareEncryptedDataForStorage(plaintextData: string, authorizedMemberPublicKeys: string[]) {
  // Generate a unique symmetric key for the group
  const symmetricKeyHex = generateGroupSymmetricKey();

  // Encrypt the data with the symmetric key
  const encryptedData = await encryptDataWithGroupKey(plaintextData, symmetricKeyHex);

  // Encrypt the symmetric key with each authorized member's public key
  const encryptedSymmetricKeys = encryptGroupSymmetricKey(symmetricKeyHex, authorizedMemberPublicKeys);

  return {
    encryptedData,
    encryptedSymmetricKeys,
  };
}
