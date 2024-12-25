use anyhow::Result;
use serde::{Deserialize, Serialize};
use chrono::{Utc, Duration};
use base64::{encode_config, URL_SAFE_NO_PAD};

use crate::utils::cryptoUtils::{pq_sign_message, pq_verify_signature};

#[derive(Serialize, Deserialize)]
pub struct PQJwtClaims {
    pub sub: String,
    pub iat: i64,
    pub exp: i64,
    // Add other claims as needed
}

/// Create a "JWT-like" token with a post-quantum signature.
pub fn create_pq_jwt(sub: &str, secret_key: &[u8]) -> Result<String> {
    let header = r#"{"alg":"Dilithium2","typ":"JWT"}"#;
    let header_b64 = encode_config(header, URL_SAFE_NO_PAD);

    let now = Utc::now().timestamp();
    let claims = PQJwtClaims {
        sub: sub.to_string(),
        iat: now,
        exp: now + (60 * 60), // expires in 1 hour
    };
    let claims_json = serde_json::to_string(&claims)?;
    let claims_b64 = encode_config(&claims_json, URL_SAFE_NO_PAD);

    let signing_input = format!("{}.{}", header_b64, claims_b64);
    let signature = pq_sign_message(signing_input.as_bytes(), secret_key)?;

    // Convert signature to base64 for inclusion
    let sig_b64 = encode_config(signature, URL_SAFE_NO_PAD);

    Ok(format!("{}.{}", signing_input, sig_b64))
}

/// Verify a PQ "JWT-like" token.
pub fn verify_pq_jwt(token: &str, public_key: &[u8]) -> Result<PQJwtClaims> {
    let parts: Vec<&str> = token.split('.').collect();
    if parts.len() != 3 {
        return Err(anyhow::anyhow!("Invalid token format"));
    }
    let header_b64 = parts[0];
    let claims_b64 = parts[1];
    let sig_b64 = parts[2];

    let signing_input = format!("{}.{}", header_b64, claims_b64);

    let signature = base64::decode_config(sig_b64, base64::URL_SAFE_NO_PAD)?;
    let verified = pq_verify_signature(signing_input.as_bytes(), &signature, public_key)?;
    if !verified {
        return Err(anyhow::anyhow!("Signature verification failed"));
    }

    let claims_json = base64::decode_config(claims_b64, base64::URL_SAFE_NO_PAD)?;
    let claims: PQJwtClaims = serde_json::from_slice(&claims_json)?;

    if Utc::now().timestamp() > claims.exp {
        return Err(anyhow::anyhow!("Token expired"));
    }

    Ok(claims)
}
