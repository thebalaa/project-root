// dkgIntegration.rs

use reqwest::Client;
use serde::{Deserialize, Serialize};
use anyhow::Result;
use std::env;

/// Publishes DataReference JSON to DKG.
/// 
/// @param data_ref_json: Serialized DataReference
/// @returns Result<(), ...>
pub async fn publish_data_reference(data_ref_json: &str) -> Result<()> {
    // Retrieve DKG API URL from environment variables
    let dkg_api_url = env::var("DKG_API_URL").unwrap_or_else(|_| "http://localhost:8000/api".to_string());

    let client = Client::new();
    let res = client.post(&format!("{}/data_reference", dkg_api_url))
        .json(&serde_json::json!({ "data_reference": data_ref_json }))
        .send()
        .await?;

    if res.status().is_success() {
        Ok(())
    } else {
        Err(anyhow::anyhow!("DKG publish failed with status: {}", res.status()))
    }
}

/// Fetches DataReference JSON from DKG given a data ID.
/// 
/// @param data_id: Identifier for the data
/// @returns Serialized DataReference JSON
pub async fn get_data_reference(data_id: &str) -> Result<String> {
    let dkg_api_url = env::var("DKG_API_URL").unwrap_or_else(|_| "http://localhost:8000/api".to_string());

    let client = Client::new();
    let res = client.get(&format!("{}/data_reference/{}", dkg_api_url, data_id))
        .send()
        .await?;

    if res.status().is_success() {
        let res_json: serde_json::Value = res.json().await?;
        let data_ref = res_json["data_reference"].as_str()
            .ok_or_else(|| anyhow::anyhow!("DKG response missing data_reference"))?
            .to_string();
        Ok(data_ref)
    } else {
        Err(anyhow::anyhow!("DKG fetch failed with status: {}", res.status()))
    }
}
