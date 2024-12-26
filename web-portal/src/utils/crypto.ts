// src/utils/crypto.ts

/**
 * crypto.ts
 * 
 * Provides hybrid encryption and decryption utilities.
 */

import crypto from 'crypto';

/**
 * Encrypts data using AES-256-GCM and encrypts the symmetric key using each member's public key.
 * @param {any} data - The plaintext data to encrypt.
 * @param {string[]} authorizedMembers - Array of authorized members' public keys.
 * @returns {EncryptedAgentData} Encrypted data and encrypted symmetric keys.
 */
export const encryptData = (data: any, authorizedMembers: string[]): EncryptedAgentData => {
  // Serialize data
  const serializedData = JSON.stringify(data);

  // Generate symmetric key and IV
  const symmetricKey = crypto.randomBytes(32); // AES-256
  const iv = crypto.randomBytes(12); // AES GCM standard

  // Encrypt data
  const cipher = crypto.createCipheriv('aes-256-gcm', symmetricKey, iv);
  let encrypted = cipher.update(serializedData, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  // Encrypt symmetric key with each member's public key
  const encryptedKeys: EncryptedKey[] = authorizedMembers.map((pubKey) => {
    const encryptedKey = crypto.publicEncrypt(
      {
        key: pubKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      symmetricKey
    );
    return {
      publicKey: pubKey,
      encryptedKey: encryptedKey.toString('hex'),
    };
  });

  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
    authTag,
    encryptedKeys,
  };
};

/**
 * Decrypts data using AES-256-GCM with the provided symmetric key.
 * @param {string} encryptedData - The encrypted data in hex format.
 * @param {string} ivHex - The initialization vector in hex format.
 * @param {string} authTagHex - The authentication tag in hex format.
 * @param {Buffer} symmetricKey - The symmetric key used for decryption.
 * @returns {any} The decrypted plaintext data.
 */
export const decryptData = (encryptedData: string, ivHex: string, authTagHex: string, symmetricKey: Buffer): any => {
  const decipher = crypto.createDecipheriv('aes-256-gcm', symmetricKey, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted);
};
