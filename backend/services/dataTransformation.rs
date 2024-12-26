// services/dataTransformation.rs

use std::collections::HashMap;
use crate::privacyPreservation::{
    pseudonymize_string, 
    generalize_numeric, 
    bin_numeric,
    encrypt_data,
};
use crate::dbIntegration::store_transformed_data;
use crate::ipfsStorage::upload_to_ipfs;
use anyhow::Result;
use serde::{Deserialize, Serialize};
use tokio::task;

/// Raw data from the client
#[derive(Debug, Deserialize)]
pub struct RawInteraction {
    pub user_id: String,
    pub url: String,
    pub request_headers: HashMap<String, String>,
    pub response_status: u16,
    pub response_body: String,
    pub timestamp: i64,
}

/// Anonymized result
#[derive(Debug, Serialize)]
pub struct AnonymizedInteraction {
    pub pseudo_user_id: String,
    pub domain_hash: String,
    pub request_headers: HashMap<String, String>,
    pub aggregated_status: String,
    pub encrypted_body_cid: String,
    pub time_bin: String,
}

/// Transform & store in an async context.
pub async fn transform_and_store(captured: crate::api::ingestor::queue::CapturedData) -> Result<()> {
    // Convert CapturedData to RawInteraction
    let interaction = RawInteraction {
        user_id: "anonymous_user".to_string(), // example, or parse from 'headers'
        url: captured.url,
        request_headers: serde_json::from_value(captured.headers)?,
        response_status: 200, // example, or parse from 'body'
        response_body: serde_json::to_string(&captured.body)?,
        timestamp: captured.timestamp as i64,
    };

    // Use blocking call (if needed) in a tokio::task::spawn_blocking
    // if your transformations are CPU-heavy or synchronous.
    let anonymized = task::spawn_blocking(move || {
        transform_data(interaction)
    })
    .await??;

    // Example storing in DB
    store_transformed_data(&[anonymized])?;

    // If you want to further queue for DKG or IPFS, you can do it here or in a separate step.
    // e.g., push to another mpsc channel or call "publish_to_dkg(...)"

    Ok(())
}

/// Synchronous transformation, can be called from a blocking task
fn transform_data(interaction: RawInteraction) -> AnonymizedInteraction {
    let pseudo_user_id = pseudonymize_string(&interaction.user_id);
    let domain_hash = pseudonymize_string(&extract_domain(&interaction.url));

    // Redact sensitive headers
    let mut anonymized_headers = HashMap::new();
    for (k, v) in interaction.request_headers.iter() {
        if is_sensitive_header(k) {
            anonymized_headers.insert(k.clone(), "REDACTED".to_string());
        } else {
            anonymized_headers.insert(k.clone(), pseudonymize_string(v));
        }
    }

    let aggregated_status = match interaction.response_status {
        200..=299 => "2xx".to_string(),
        300..=399 => "3xx".to_string(),
        400..=499 => "4xx".to_string(),
        500..=599 => "5xx".to_string(),
        _ => "other".to_string(),
    };

    // Encrypt and store response body in IPFS
    let encrypted = encrypt_data(interaction.response_body.as_bytes());
    let encrypted_body_cid = upload_to_ipfs(encrypted);

    let time_bin = bin_numeric(interaction.timestamp, 3600); // e.g. bin by hour

    AnonymizedInteraction {
        pseudo_user_id,
        domain_hash,
        request_headers: anonymized_headers,
        aggregated_status,
        encrypted_body_cid,
        time_bin,
    }
}

fn extract_domain(url: &str) -> String {
    let parts: Vec<&str> = url.split('/').collect();
    if parts.len() > 2 {
        parts[2].to_string()
    } else {
        url.to_string()
    }
}
fn is_sensitive_header(header_key: &str) -> bool {
    let lower = header_key.to_lowercase();
    lower.contains("authorization")
        || lower.contains("cookie")
        || lower.contains("token")
}

pub async fn publish_pending_records() -> Result<()> {
    let records = fetch_unpublished_records_from_db()?; // e.g. SELECT * FROM anonymized_interactions WHERE published=false

    for rec in records {
        let data_ref_json = serde_json::to_string(&rec)?;
        if let Err(e) = publish_data_reference(&data_ref_json).await {
            eprintln!("Error publishing record {}: {:?}", rec.domain_hash, e);
            // handle error or retry
        } else {
            mark_record_as_published(&rec)?; 
        }
    }
    Ok(())
}
