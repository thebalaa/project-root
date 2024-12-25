// ipfsStorage.rs

use reqwest::Client;
use anyhow::Result;
use std::env;

/// Uploads encrypted data to IPFS and returns the IPFS hash.
pub async fn upload_encrypted_data(encrypted_data_hex: &str) -> Result<String> {
    // Retrieve IPFS API URL from environment variables
    let ipfs_api_url = env::var("IPFS_API_URL").unwrap_or_else(|_| "http://localhost:5001".to_string());

    let client = Client::new();
    let form = reqwest::multipart::Form::new()
        .part("file", reqwest::multipart::Part::text(encrypted_data_hex.to_string()));

    let res = client.post(&format!("{}/api/v0/add", ipfs_api_url))
        .multipart(form)
        .send()
        .await?;

    if res.status().is_success() {
        let res_json: serde_json::Value = res.json().await?;
        let ipfs_hash = res_json["Hash"].as_str()
            .ok_or_else(|| anyhow::anyhow!("IPFS response missing Hash"))?
            .to_string();
        Ok(ipfs_hash)
    } else {
        Err(anyhow::anyhow!("IPFS upload failed with status: {}", res.status()))
    }
}

/// Fetches encrypted data from IPFS given its hash.
pub async fn fetch_encrypted_data(ipfs_hash: &str) -> Result<String> {
    let ipfs_gateway_url = env::var("IPFS_GATEWAY_URL").unwrap_or_else(|_| "https://ipfs.io/ipfs/".to_string());

    let client = Client::new();
    let url = format!("{}{}", ipfs_gateway_url, ipfs_hash);

    let res = client.get(&url)
        .send()
        .await?;

    if res.status().is_success() {
        let data = res.text().await?;
        Ok(data)
    } else {
        Err(anyhow::anyhow!("IPFS fetch failed with status: {}", res.status()))
    }
}
