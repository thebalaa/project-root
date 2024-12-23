use serde::{Deserialize, Serialize};
use reqwest::Client;
use std::error::Error;

#[derive(Debug, Deserialize, Serialize)]
struct CapturedData {
    id: String,
    url: String,
    headers: serde_json::Value,
    body: serde_json::Value,
    timestamp: u64,
    sensitive_data: bool,
}

#[derive(Debug, Serialize)]
struct TransformedData {
    id: String,
    url: String,
    headers: String,
    content: String,
    timestamp: String,
}

pub struct DataTransformer {
    dkg_endpoint: String,
    ipfs_endpoint: String,
    client: Client,
}

impl DataTransformer {
    pub fn new(dkg_endpoint: String, ipfs_endpoint: String) -> Self {
        Self {
            dkg_endpoint,
            ipfs_endpoint,
            client: Client::new(),
        }
    }

    // Fetch data from the ingestion queue
    pub async fn fetch_data_from_queue(&self, queue_url: &str) -> Result<Option<CapturedData>, Box<dyn Error>> {
        let response = self.client.get(queue_url).send().await?;
        if response.status().is_success() {
            let data = response.json::<CapturedData>().await?;
            Ok(Some(data))
        } else {
            eprintln!("Failed to fetch data from queue: {}", response.status());
            Ok(None)
        }
    }

    // Transform and normalize data
    fn transform_data(&self, data: CapturedData) -> TransformedData {
        TransformedData {
            id: data.id,
            url: data.url,
            headers: serde_json::to_string(&data.headers).unwrap_or_default(),
            content: serde_json::to_string(&data.body).unwrap_or_default(),
            timestamp: chrono::NaiveDateTime::from_timestamp(data.timestamp as i64, 0).to_string(),
        }
    }

    // Send to DKG integration module
    pub async fn send_to_dkg(&self, transformed_data: &TransformedData) -> Result<(), Box<dyn Error>> {
        let response = self
            .client
            .post(&self.dkg_endpoint)
            .json(transformed_data)
            .send()
            .await?;
        if response.status().is_success() {
            println!("Data successfully send to DKG integration module");
        } else {
            eprintln!("Failed to send data to DKG integration module: {}", response.status());
        }
        Ok(())
    }

    // Store data in IPFS
    pub async fn store_in_ipfs(&self, transformed_data: &TransformedData) -> Result<(), Box<dyn Error>> {
        let response = self
            .client
            .post(&self.ipfs_endpoint)
            .json(transformed_data)
            .send()
            .await?;
        if response.status().is_success() {
            let cid: serde_json::Value = response.json().await?;
            println!("Data stored in IPFS with CID: {}", cid["cid"]);
        } else {
            eprintln!("Failed to store data in IPFS: {}", response.status());
        }
        Ok(())
    }

    // Main processing method
    pub async fn process_data(&self, queue_url: &str) -> Result<(), Box<dyn Error>> {
        if let Some(data) = self.fetch_data_from_queue(queue_url).await? {
            let transformed_data = self.transform_data(data);
            self.store_in_dkg(&transformed_data).await?;
            self.store_in_ipfs(&transformed_data).await?;
        }
        Ok(())
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let transformer = DataTransformer::new(
        "http://dkg-service.local/publish".to_string(),
        "http://ipfs-service.local/add".to_string(),
    );

    let queue_url = "http://localhost:8080/queue/fetch";

    transformer.process_data(queue_url).await?;
    Ok(())
}
