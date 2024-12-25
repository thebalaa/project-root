// security.rs

use actix_web::{web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use crate::services::hybridEncryption;
use crate::utils::errorHandler::AppError;

/// Request payload for storing encrypted data
#[derive(Deserialize)]
pub struct StoreEncryptedDataRequest {
    pub data: String, // Encrypted data in hex format
    pub encrypted_keys: Vec<hybridEncryption::EncryptedSymmetricKey>,
}

/// Response for storing data
#[derive(Serialize)]
pub struct StoreEncryptedDataResponse {
    pub success: bool,
    pub message: String,
}

/// Endpoint to store encrypted data
pub async fn store_encrypted_data_handler(req: web::Json<StoreEncryptedDataRequest>) -> Result<impl Responder, AppError> {
    let payload = hybridEncryption::EncryptedDataPayload {
        data: req.data.clone(),
        encrypted_keys: req.encrypted_keys.clone(),
    };

    hybridEncryption::store_encrypted_data(payload).await?;

    Ok(HttpResponse::Ok().json(StoreEncryptedDataResponse {
        success: true,
        message: "Data stored successfully".to_string(),
    }))
}

/// Request payload for retrieving data
#[derive(Deserialize)]
pub struct RetrieveDataRequest {
    pub data_id: String, // Identifier for the data
    pub member_id: String, // Identifier for the requesting member
    pub member_private_key: String, // Hex-encoded private key
}

/// Response for retrieving data
#[derive(Serialize)]
pub struct RetrieveDataResponse {
    pub success: bool,
    pub data: Option<String>,
    pub message: String,
}

/// Endpoint to retrieve decrypted data
pub async fn retrieve_decrypted_data_handler(req: web::Json<RetrieveDataRequest>) -> Result<impl Responder, AppError> {
    let decrypted_data = hybridEncryption::retrieve_decrypted_data(
        &req.data_id,
        &req.member_id,
        &req.member_private_key,
    ).await?;

    Ok(HttpResponse::Ok().json(RetrieveDataResponse {
        success: true,
        data: Some(decrypted_data),
        message: "Data retrieved and decrypted successfully".to_string(),
    }))
}
