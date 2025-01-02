/**
 * groupEncryption.ts
 * 
 * Temporarily stubbing out group encryption for testing/development.
 * Remove or revert when real encryption is integrated.
 */

import { generatePQKeyPair, encapsulatePQ, decapsulatePQ } from './postQuantumCrypto';
import { bufferToHex, hexToBuffer } from '../../utils/common';

export interface EncryptedGroupKey {
  memberId: string;
  encryptedSymmetricKey: string;
}

/**
 * STUB: Return a fake hex just for demonstration.
 */
export function generateGroupSymmetricKey(): string {
  // Original logic commented out:
  /*
  const symmetricKey = crypto.getRandomValues(new Uint8Array(32));
  return bufferToHex(symmetricKey);
  */
  return 'FAKE_SYMMETRIC_KEY_HEX';
}

/**
 * STUB: Return the plaintext in hex for now.
 */
export function encryptDataWithGroupKey(plaintext: string, symmetricKeyHex: string): Promise<string> {
  // Original logic commented out:
  /*
  ... real encryption with AES-GCM ...
  */
  return Promise.resolve(bufferToHex(new TextEncoder().encode(plaintext)));
}

/**
 * STUB: Return the hex-decoded plaintext as string.
 */
export function decryptDataWithGroupKey(encryptedDataHex: string, symmetricKeyHex: string): Promise<string> {
  // Original logic commented out:
  /*
  ... real AES-GCM decryption ...
  */
  const decoded = new TextDecoder().decode(hexToBuffer(encryptedDataHex));
  return Promise.resolve(decoded);
}

/**
 * STUB: Return dummy encrypted group key objects.
 */
export function encryptGroupSymmetricKey(symmetricKeyHex: string, memberPublicKeys: string[]): EncryptedGroupKey[] {
  // Original logic commented out:
  /*
  ... real PQC encapsulation ...
  */
  return memberPublicKeys.map((_, index) => ({
    memberId: `member_${index + 1}`,
    encryptedSymmetricKey: 'FAKE_ENCRYPTED_SYM_KEY',
  }));
}

/**
 * STUB: Return the original symmetric key, ignoring decryption.
 */
export async function decryptGroupSymmetricKey(encryptedSymmetricKeyHex: string, userPrivateKeyHex: string): Promise<string> {
  // Original logic commented out:
  /*
  const sharedSecret = await decapsulatePQ(userPrivateKeyHex, encryptedSymmetricKeyHex);
  return sharedSecret;
  */
  return Promise.resolve('FAKE_SYMMETRIC_KEY_HEX');
}

/**
 * STUB: Just packages the data and returns them in a trivial object.
 */
export async function prepareEncryptedDataForStorage(plaintextData: string, authorizedMemberPublicKeys: string[]) {
  // Original logic commented out:
  /*
  const symmetricKeyHex = generateGroupSymmetricKey();
  const encryptedData = await encryptDataWithGroupKey(plaintextData, symmetricKeyHex);
  const encryptedSymmetricKeys = encryptGroupSymmetricKey(symmetricKeyHex, authorizedMemberPublicKeys);
  return {
    encryptedData,
    encryptedSymmetricKeys,
  };
  */
  return {
    encryptedData: btoa(plaintextData),
    encryptedSymmetricKeys: authorizedMemberPublicKeys.map((_, i) => ({
      memberId: `member_${i + 1}`,
      encryptedSymmetricKey: 'FAKE_ENCRYPTED_SYM_KEY',
    })),
  };
}
