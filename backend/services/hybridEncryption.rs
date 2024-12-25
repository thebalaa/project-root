// hybridEncryption.rs
//
// Service for handling hybrid encryption: symmetric encryption of data,
// asymmetric encryption of symmetric keys, storing encrypted data on IPFS,
// and storing references and encrypted keys on the blockchain via DKG.

use crate::services::ipfsStorage;
use crate::services::dkgIntegration;
use crate::utils::cryptoUtils;
use crate::utils::errorHandler::AppError;
use serde::{Deserialize, Serialize};
use anyhow::Result;

/// Represents the payload received for storing encrypted data.
#[derive(Serialize, Deserialize)]
pub struct EncryptedDataPayload {
    pub data: String, // Encrypted data in hex format
    pub encrypted_keys: Vec<EncryptedSymmetricKey>,
}

/// Represents an encrypted symmetric key for a specific member.
#[derive(Serialize, Deserialize)]
pub struct EncryptedSymmetricKey {
    pub member_id: String,
    pub encrypted_key: String, // Encrypted symmetric key in hex format
}

/// Represents the data reference to be stored on the blockchain.
#[derive(Serialize, Deserialize)]
pub struct DataReference {
    pub ipfs_hash: String,
    pub encrypted_keys: Vec<EncryptedSymmetricKey>,
}

impl DataReference {
    pub fn new(ipfs_hash: String, encrypted_keys: Vec<EncryptedSymmetricKey>) -> Self {
        DataReference {
            ipfs_hash,
            encrypted_keys,
        }
    }
}

/// Handles the process of storing encrypted data:
/// 1. Receives EncryptedDataPayload
/// 2. Stores data on IPFS
/// 3. Stores DataReference on the blockchain via DKG
pub async fn store_encrypted_data(payload: EncryptedDataPayload) -> Result<(), AppError> {
    // Step 1: Upload encrypted data to IPFS
    let ipfs_hash = ipfsStorage::upload_encrypted_data(&payload.data)
        .await
        .map_err(|e| AppError::IpfsUploadError(e.to_string()))?;

    // Step 2: Create DataReference
    let data_ref = DataReference::new(ipfs_hash, payload.encrypted_keys);

    // Step 3: Serialize DataReference to JSON
    let data_ref_json = serde_json::to_string(&data_ref)
        .map_err(|e| AppError::SerializationError(e.to_string()))?;

    // Step 4: Publish DataReference to DKG
    dkgIntegration::publish_data_reference(&data_ref_json)
        .await
        .map_err(|e| AppError::DkgPublishError(e.to_string()))?;

    Ok(())
}

/// Retrieves and decrypts data for an authorized member.
/// 
/// Steps:
/// 1. Fetches DataReference from DKG.
/// 2. Fetches encrypted data from IPFS.
/// 3. Decrypts the symmetric key with member's private key.
/// 4. Decrypts data with symmetric key.
/// 
/// @param data_id: Identifier for the data (e.g., IPFS hash or another identifier)
/// @param member_id: Identifier for the requesting member
/// @param member_private_key: Member's private key for decrypting the symmetric key
/// @returns Decrypted data as a string
pub async fn retrieve_decrypted_data(
    data_id: &str,
    member_id: &str,
    member_private_key: &str, // Hex-encoded private key
) -> Result<String, AppError> {
    // Step 1: Fetch DataReference from DKG
    let data_ref_json = dkgIntegration::get_data_reference(data_id)
        .await
        .map_err(|e| AppError::DkgFetchError(e.to_string()))?;

    let data_ref: DataReference = serde_json::from_str(&data_ref_json)
        .map_err(|e| AppError::DeserializationError(e.to_string()))?;

    // Step 2: Find the encrypted symmetric key for the member
    let encrypted_key_option = data_ref.encrypted_keys.iter()
        .find(|ek| ek.member_id == member_id);

    let encrypted_key = match encrypted_key_option {
        Some(ek) => &ek.encrypted_key,
        None => return Err(AppError::AccessDenied("No encrypted key found for member".to_string())),
    };

    // Step 3: Decrypt the symmetric key with member's private key
    let symmetric_key = cryptoUtils::pq_kem_decapsulate(
        &hex::decode(member_private_key).map_err(|e| AppError::CryptoError(e.to_string()))?,
        &hex::decode(encrypted_key).map_err(|e| AppError::CryptoError(e.to_string()))?,
    ).map_err(|e| AppError::CryptoError(e.to_string()))?;

    let symmetric_key_hex = hex::encode(symmetric_key);

    // Step 4: Fetch encrypted data from IPFS
    let encrypted_data = ipfsStorage::fetch_encrypted_data(&data_ref.ipfs_hash)
        .await
        .map_err(|e| AppError::IpfsFetchError(e.to_string()))?;

    // Step 5: Decrypt data with symmetric key
    let decrypted_data = cryptoUtils::decrypt_with_aes_gcm(&encrypted_data, &symmetric_key_hex)
        .await
        .map_err(|e| AppError::CryptoError(e.to_string()))?;

    Ok(decrypted_data)
}
