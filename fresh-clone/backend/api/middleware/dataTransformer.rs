use serde::{Deserialize, Serialize};
use reqwest::Client;
use std::error::Error;
use chrono::NaiveDateTime;

// Import the IPFS storage logic
use crate::services::ipfsStorage::{IpfsStorage, TransformedData as IpfsTransformedData};

#[derive(Debug, Deserialize, Serialize)]
struct CapturedData {
    id: String,
    url: String,
    headers: serde_json::Value,
    body: serde_json::Value,
    timestamp: u64,
    sensitive_data: bool,
}

// We keep a local definition for the 'TransformedData' so we can shape the data
// exactly how we want for DKG, etc. Then we'll adapt/convert to IpfsTransformedData
// if needed. Alternatively, you can unify them, but sometimes you want different 
// fields or formats for different modules.
#[derive(Debug, Serialize)]
struct DkgTransformedData {
    id: String,
    url: String,
    headers: String,
    content: String,
    timestamp: String,
}

pub struct DataTransformer {
    dkg_endpoint: String,
    client: Client,
    ipfs: IpfsStorage,  // IPFS client instance
}

impl DataTransformer {
    pub fn new(dkg_endpoint: String, ipfs_endpoint: String) -> Self {
        Self {
            dkg_endpoint,
            client: Client::new(),
            ipfs: IpfsStorage::new(&ipfs_endpoint),
        }
    }

    /// Fetch data from an ingestion queue
    pub async fn fetch_data_from_queue(
        &self,
        queue_url: &str
    ) -> Result<Option<CapturedData>, Box<dyn Error>> {
        let response = self.client.get(queue_url).send().await?;
        if response.status().is_success() {
            let data = response.json::<CapturedData>().await?;
            Ok(Some(data))
        } else {
            eprintln!("Failed to fetch data from queue: {}", response.status());
            Ok(None)
        }
    }

    /// Transform raw CapturedData into the structure needed for DKG
    fn transform_for_dkg(&self, data: &CapturedData) -> DkgTransformedData {
        DkgTransformedData {
            id: data.id.clone(),
            url: data.url.clone(),
            headers: serde_json::to_string(&data.headers).unwrap_or_default(),
            content: serde_json::to_string(&data.body).unwrap_or_default(),
            timestamp: NaiveDateTime::from_timestamp(data.timestamp as i64, 0).to_string(),
        }
    }

    /// Transform the same data for IPFS usage, if you want a slightly different schema or fields
    fn transform_for_ipfs(&self, data: &CapturedData) -> IpfsTransformedData {
        IpfsTransformedData {
            id: data.id.clone(),
            url: data.url.clone(),
            headers: serde_json::to_string(&data.headers).unwrap_or_default(),
            content: serde_json::to_string(&data.body).unwrap_or_default(),
            timestamp: NaiveDateTime::from_timestamp(data.timestamp as i64, 0).to_string(),
        }
    }

    /// Send to DKG integration module
    pub async fn send_to_dkg(
        &self,
        transformed_data: &DkgTransformedData
    ) -> Result<(), Box<dyn Error>> {
        let response = self
            .client
            .post(&self.dkg_endpoint)
            .json(transformed_data)
            .send()
            .await?;
        if response.status().is_success() {
            println!("Data successfully sent to DKG integration module.");
        } else {
            eprintln!("Failed to send data to DKG integration module: {}", response.status());
        }
        Ok(())
    }

    /// Main processing method
    pub async fn process_data(&self, queue_url: &str) -> Result<(), Box<dyn Error>> {
        if let Some(data) = self.fetch_data_from_queue(queue_url).await? {
            // Transform for DKG
            let dkg_data = self.transform_for_dkg(&data);
            self.send_to_dkg(&dkg_data).await?;

            // Transform for IPFS
            let ipfs_data = self.transform_for_ipfs(&data);
            // Delegate storing to IpfsStorage
            match self.ipfs.store_data(&ipfs_data).await {
                Ok(cid) => {
                    println!("Successfully stored data in IPFS with CID: {}", cid);
                }
                Err(e) => {
                    eprintln!("Error storing data in IPFS: {}", e);
                }
            }
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
