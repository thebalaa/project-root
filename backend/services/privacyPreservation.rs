// services/privacyPreservation.rs

use sha2::{Sha256, Digest};
use rand::{thread_rng, Rng};
use rand::distributions::Alphanumeric;

/// Pseudonymize a string by hashing it with SHA-256.
/// In production, you might want an HMAC with a secret key or a peppered approach.
pub fn pseudonymize_string(data: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(data.as_bytes());
    let result = hasher.finalize();
    format!("{:x}", result)
}

/// Generalize a numeric value by rounding it to the nearest interval.
/// For example, 127 => 100, 24 => 0, etc.
pub fn generalize_numeric(value: i64, interval: i64) -> i64 {
    let remainder = value % interval;
    value - remainder
}

/// Bin a numeric value into a labeled bucket. 
/// E.g., if `interval`=3600, a timestamp could be truncated to an hour bin.
pub fn bin_numeric(value: i64, interval: i64) -> String {
    let bin_start = generalize_numeric(value, interval);
    let bin_end = bin_start + interval - 1;
    format!("{}-{}", bin_start, bin_end)
}

/// Example symmetric encryption for data at rest.
/// In real production, use a library for robust encryption, key management, etc.
pub fn encrypt_data(plaintext: &[u8]) -> Vec<u8> {
    // For demonstration only. This is *not* secure cryptography in production.
    // A real approach might use AES-GCM with a random nonce.
    let mut rng = thread_rng();
    let key: [u8; 16] = rng.gen();
    let mut encrypted = plaintext.to_vec();
    for i in 0..encrypted.len() {
        encrypted[i] ^= key[i % key.len()];
    }
    // Prepend the random key so we can decrypt later (in a real system, store key securely).
    let mut output = key.to_vec();
    output.extend(encrypted);
    output
}

/// Example function for generating a random token
pub fn generate_random_token(length: usize) -> String {
    thread_rng()
        .sample_iter(&Alphanumeric)
        .take(length)
        .map(char::from)
        .collect()
}
