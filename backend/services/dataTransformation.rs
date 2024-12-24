// services/dataTransformation.rs

use std::collections::HashMap;
use crate::privacyPreservation::{
    pseudonymize_string, 
    generalize_numeric, 
    bin_numeric,
    encrypt_data,
    // Potentially more advanced functions
};
use crate::dbIntegration::store_transformed_data;
use crate::ipfsStorage::upload_to_ipfs;

/// Represents a raw request/response pair to be anonymized.
#[derive(Debug)]
pub struct RawInteraction {
    pub user_id: String,
    pub url: String,
    pub request_headers: HashMap<String, String>,
    pub response_status: u16,
    pub response_body: String,
    pub timestamp: i64, // Unix timestamp
    // ... any other fields
}

/// Represents anonymized/transformed data.
#[derive(Debug)]
pub struct AnonymizedInteraction {
    pub pseudo_user_id: String,
    pub domain_hash: String,
    pub request_headers: HashMap<String, String>,
    pub aggregated_status: String,
    pub encrypted_body_cid: String,
    pub time_bin: String,
    // ... any other fields
}

/// Transforms raw data into anonymized data.
pub fn transform_data(interaction: RawInteraction) -> AnonymizedInteraction {
    // 1. Pseudonymize user ID
    let pseudo_user_id = pseudonymize_string(&interaction.user_id);

    // 2. Hash or generalize the domain of the URL
    let domain_hash = pseudonymize_string(&extract_domain(&interaction.url));

    // 3. Redact or partially hash sensitive headers
    let mut anonymized_headers = HashMap::new();
    for (k, v) in interaction.request_headers.iter() {
        if is_sensitive_header(k) {
            anonymized_headers.insert(k.clone(), "REDACTED".to_string());
        } else {
            anonymized_headers.insert(k.clone(), pseudonymize_string(v));
        }
    }

    // 4. Aggregate the response status code into bracket
    let aggregated_status = match interaction.response_status {
        200..=299 => "2xx".to_string(),
        300..=399 => "3xx".to_string(),
        400..=499 => "4xx".to_string(),
        500..=599 => "5xx".to_string(),
        _ => "other".to_string(),
    };

    // 5. Encrypt and store response body in IPFS
    let encrypted_body = encrypt_data(interaction.response_body.as_bytes());
    let encrypted_body_cid = upload_to_ipfs(encrypted_body);

    // 6. Bin or generalize the timestamp
    let time_bin = bin_numeric(interaction.timestamp, 3600); // e.g., bin by hour

    AnonymizedInteraction {
        pseudo_user_id,
        domain_hash,
        request_headers: anonymized_headers,
        aggregated_status,
        encrypted_body_cid,
        time_bin,
    }
}

/// Save the anonymized data to local DB, IPFS, or queue it for DKG usage.
pub fn process_and_store_data(interactions: Vec<RawInteraction>) {
    let mut anonymized_records = Vec::new();

    for interaction in interactions {
        let anon = transform_data(interaction);
        anonymized_records.push(anon);
    }

    // store in DB or forward to DKG
    store_transformed_data(&anonymized_records);
}

/// Very simplistic domain extraction - you'd want something more robust in production.
fn extract_domain(url: &str) -> String {
    let parts: Vec<&str> = url.split("/").collect();
    if parts.len() > 2 {
        parts[2].to_string()
    } else {
        url.to_string()
    }
}

fn is_sensitive_header(header_key: &str) -> bool {
    let lower = header_key.to_lowercase();
    lower.contains("authorization") ||
    lower.contains("cookie") ||
    lower.contains("token")
}
