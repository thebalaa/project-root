// keyManagement.ts
// Implementation for generating and securely storing keys

export async function generateKeyPair(): Promise<{ publicKey: CryptoKey; privateKey: CryptoKey }> {
  // Generate an asymmetric key pair using SubtleCrypto (e.g., RSA or ECDSA)
  const keyPair = await crypto.subtle.generateKey(
      {
          name: "RSA-OAEP",
          modulusLength: 2048, // Key size in bits
          publicExponent: new Uint8Array([1, 0, 1]), // Common exponent (65537)
          hash: "SHA-256", // Hash function
      },
      true, // Extractable keys
      ["encrypt", "decrypt"]
  );

  return {
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
  };
}

export function storeKey(key: CryptoKey): boolean {
  // Example: Securely store the key using IndexedDB or another secure storage mechanism
  // This placeholder demonstrates a synchronous interface for simplicity

  try {
      // Convert the key to a storable format (e.g., JWK)
      crypto.subtle.exportKey("jwk", key).then((exportedKey) => {
          localStorage.setItem("privateKey", JSON.stringify(exportedKey));
      });
      return true;
  } catch (error) {
      console.error("Failed to store the key:", error);
      return false;
  }
}
