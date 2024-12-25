// cryptoUtils.rs

use anyhow::Result;
use pqcrypto::kem::kyber512;
use pqcrypto::sign::dilithium2;
use aes_gcm::Aes256Gcm; // Using AES-256-GCM
use aes_gcm::aead::{Aead, KeyInit, OsRng, generic_array::GenericArray};
use hex;

/// Converts a byte array to a hex string.
pub fn buffer_to_hex(buffer: &[u8]) -> String {
    hex::encode(buffer)
}

/// Converts a hex string to a byte array.
pub fn hex_to_buffer(hex_str: &str) -> Vec<u8> {
    hex::decode(hex_str).expect("Invalid hex string")
}

/// Decrypts AES-GCM encrypted data.
/// 
/// @param encrypted_data_hex: Hex-encoded encrypted data (IV + ciphertext)
/// @param symmetric_key_hex: Hex-encoded AES symmetric key
/// @returns Decrypted plaintext as String
pub async fn decrypt_with_aes_gcm(encrypted_data_hex: &str, symmetric_key_hex: &str) -> Result<String> {
    let encrypted_data = hex::decode(encrypted_data_hex)?;
    if encrypted_data.len() < 12 {
        return Err(anyhow::anyhow!("Invalid encrypted data length"));
    }
    let iv = &encrypted_data[..12]; // Extract IV
    let ciphertext = &encrypted_data[12..];
    let symmetric_key = hex::decode(symmetric_key_hex)?;

    let key = GenericArray::from_slice(&symmetric_key);
    let cipher = Aes256Gcm::new(key);

    let decrypted_bytes = cipher.decrypt(GenericArray::from_slice(iv), ciphertext)
        .map_err(|e| anyhow::anyhow!("AES-GCM decryption failed: {}", e))?;

    let plaintext = String::from_utf8(decrypted_bytes)
        .map_err(|e| anyhow::anyhow!("Invalid UTF-8 data: {}", e))?;

    Ok(plaintext)
}

/// Encrypts data using AES-GCM.
/// 
/// @param plaintext: The data to encrypt.
/// @param symmetric_key_hex: Hex-encoded AES symmetric key.
/// @returns Hex-encoded encrypted data (IV + ciphertext)
pub async fn encrypt_with_aes_gcm(plaintext: &str, symmetric_key_hex: &str) -> Result<String> {
    let symmetric_key = hex::decode(symmetric_key_hex)?;
    let key = GenericArray::from_slice(&symmetric_key);
    let cipher = Aes256Gcm::new(key);

    let iv = aes_gcm::aead::generate_iv(&mut OsRng); // 96-bit nonce
    let ciphertext = cipher.encrypt(&GenericArray::from_slice(&iv), plaintext.as_bytes())
        .map_err(|e| anyhow::anyhow!("AES-GCM encryption failed: {}", e))?;

    // Combine IV and ciphertext
    let mut combined = Vec::new();
    combined.extend_from_slice(&iv);
    combined.extend_from_slice(&ciphertext);

    Ok(hex::encode(combined))
}

/// Decapsulates a shared secret using the recipient's Kyber secret key and cipherText.
/// 
/// @param secretKey: Byte array of recipient's Kyber secret key
/// @param cipherText: Byte array of encrypted symmetric key
/// @returns Shared secret as a byte array
pub fn pq_kem_decapsulate(secretKey: &[u8], cipherText: &[u8]) -> Result<Vec<u8>> {
    let sk = kyber512::SecretKey::from_bytes(secretKey).map_err(|e| anyhow::anyhow!(e))?;
    let ct = kyber512::Ciphertext::from_bytes(cipherText).map_err(|e| anyhow::anyhow!(e))?;
    let shared_secret = kyber512::decapsulate(&ct, &sk);
    Ok(shared_secret.as_bytes().to_vec())
}
