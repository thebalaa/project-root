use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::error::Error;

/// Structure for IPFS-specific transformations
/// (Mirrors the relevant fields from your dataTransformer).
#[derive(Debug, Serialize, Deserialize)]
pub struct TransformedData {
    pub id: String,
    pub url: String,
    pub headers: String,
    pub content: String,
    pub timestamp: String,
}

pub struct IpfsStorage {
    ipfs_endpoint: String,
    client: Client,
}

impl IpfsStorage {
    pub fn new(ipfs_endpoint: &str) -> Self {
        Self {
            ipfs_endpoint: ipfs_endpoint.to_string(),
            client: Client::new(),
        }
    }

    /// Store data in IPFS by POSTing to an IPFS HTTP endpoint.
    /// Returns the CID (content identifier) on success.
    pub async fn store_data(&self, data: &TransformedData) -> Result<String, Box<dyn Error>> {
        // Example: IPFS endpoint for adding data might be "/api/v0/add", 
        // or something custom that returns a JSON with {"cid": "..."}.
        let response = self
            .client
            .post(&self.ipfs_endpoint)
            .json(data)
            .send()
            .await?;

        if response.status().is_success() {
            // Suppose the IPFS endpoint returns a JSON object with a "cid" field.
            let cid_json: Value = response.json().await?;
            let cid = cid_json["cid"].as_str().unwrap_or_default().to_string();
            if cid.is_empty() {
                eprintln!("No 'cid' field found in IPFS response.");
            } else {
                println!("Data stored in IPFS with CID: {}", cid);
            }
            Ok(cid)
        } else {
            let status = response.status();
            eprintln!("Failed to store data in IPFS: {}", status);
            Err(format!("IPFS store request failed with status: {}", status).into())
        }
    }
}
