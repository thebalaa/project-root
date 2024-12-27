import { describe, it, expect } from '@jest/globals';
import { encryptData, decryptData } from '../src/encryption/src/encryption';
// We also need a generateKey function:
import { generateKey } from '../src/encryption/src/keyManagement';
// or wherever you have your key generation logic
describe('Encryption Module', () => {
it('should encrypt and decrypt data using AES-GCM', async () => {
const key = await generateKey();
const plaintext = 'Hello, confidential world!';
const encrypted = await encryptData(plaintext, key);
expect(typeof encrypted).toBe('string');
expect(encrypted).not.toBe(plaintext); // ciphertext should differ
const decrypted = await decryptData(encrypted, key);
expect(decrypted).toBe(plaintext);
});
it('should handle empty strings', async () => {
const key = await generateKey();
const encrypted = await encryptData('', key);
const decrypted = await decryptData(encrypted, key);
expect(decrypted).toBe('');
});
});