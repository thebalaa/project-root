//! aiIntegration.rs
//! 
//! Provides functionality to call or integrate with the Federated Learning AI microservice.
//! For example, sending data or retrieving ML model outputs.

use reqwest::blocking::Client; // or async reqwest, if needed
use serde::{Deserialize, Serialize};
use std::error::Error;

#[derive(Debug, Serialize, Deserialize)]
pub struct AIRequest {
    pub input_data: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AIResponse {
    pub prediction: String,
}

pub struct AIIntegration {
    pub base_url: String, // e.g., "http://localhost:5000"
}

impl AIIntegration {
    pub fn new(base_url: &str) -> Self {
        Self {
            base_url: base_url.to_string(),
        }
    }

    /// Send data to the AI microservice for prediction.
    pub fn send_data_for_prediction(&self, data: &str) -> Result<AIResponse, Box<dyn Error>> {
        let request = AIRequest {
            input_data: data.to_string(),
        };

        let client = Client::new();
        let url = format!("{}/predict", self.base_url);
        let resp = client.post(&url)
            .json(&request)
            .send()?
            .json::<AIResponse>()?;

        Ok(resp)
    }

    /// Example method for retrieving model or health info from AI service.
    pub fn get_service_health(&self) -> Result<String, Box<dyn Error>> {
        let url = format!("{}/health", self.base_url);
        let response = Client::new().get(&url).send()?;
        Ok(response.text()?)
    }
}
