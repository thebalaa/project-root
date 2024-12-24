//! dkgIntegration.rs
//! 
//! Interacts with the Decentralized Knowledge Graph (DKG).
//! E.g., publishing assets, retrieving knowledge references, etc.

use reqwest::blocking::Client;
use serde::{Serialize, Deserialize};
use std::error::Error;

#[derive(Debug, Serialize, Deserialize)]
pub struct PublishRequest {
    pub data_cid: String,
    pub metadata: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PublishResponse {
    pub success: bool,
    pub message: String,
}

pub struct DKGIntegration {
    pub node_url: String,    // e.g., "http://localhost:8900"
    pub api_key: String,     // DKG API key if needed
}

impl DKGIntegration {
    pub fn new(node_url: &str, api_key: &str) -> Self {
        Self {
            node_url: node_url.to_string(),
            api_key: api_key.to_string(),
        }
    }

    /// Publishes an asset or knowledge reference to the DKG.
    pub fn publish_asset(&self, cid: &str, meta: &str) -> Result<PublishResponse, Box<dyn Error>> {
        let url = format!("{}/publish", self.node_url);
        let request_body = PublishRequest {
            data_cid: cid.to_string(),
            metadata: meta.to_string(),
        };

        let client = Client::new();
        let resp = client.post(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .json(&request_body)
            .send()?
            .json::<PublishResponse>()?;

        Ok(resp)
    }

    /// Fetch data from DKG (placeholder).
    pub fn fetch_asset(&self, cid: &str) -> Result<String, Box<dyn Error>> {
        let url = format!("{}/fetch/{}", self.node_url, cid);
        let resp = Client::new()
            .get(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .send()?;

        Ok(resp.text()?)
    }
}
