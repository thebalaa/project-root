// encryption.ts
// Implementation of encryption logic (e.g., AES-GCM or other algorithms)

export async function encryptData(plaintext: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  // Perform encryption using SubtleCrypto (browser built-in API)
  const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization vector
  const encrypted = await crypto.subtle.encrypt(
      {
          name: "AES-GCM",
          iv: iv
      },
      key,
      data
  );

  // Combine IV and ciphertext for storage
  const encryptedData = new Uint8Array(iv.byteLength + encrypted.byteLength);
  encryptedData.set(iv, 0);
  encryptedData.set(new Uint8Array(encrypted), iv.byteLength);

  return btoa(String.fromCharCode(...encryptedData)); // Base64 encode
}

export async function decryptData(ciphertext: string, key: CryptoKey): Promise<string> {
  const encryptedData = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));

  // Extract IV and encrypted message
  const iv = encryptedData.slice(0, 12);
  const encryptedMessage = encryptedData.slice(12);

  // Perform decryption using SubtleCrypto
  const decrypted = await crypto.subtle.decrypt(
      {
          name: "AES-GCM",
          iv: iv
      },
      key,
      encryptedMessage
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted); // Return plaintext
}

export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
      {
          name: "AES-GCM",
          length: 256
      },
      true, // Extractable
      ["encrypt", "decrypt"]
  );
}
