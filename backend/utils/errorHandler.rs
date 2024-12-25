// errorHandler.rs

use thiserror::Error;

/// Custom application error types.
#[derive(Error, Debug)]
pub enum AppError {
    #[error("IPFS upload failed: {0}")]
    IpfsUploadError(String),

    #[error("IPFS fetch failed: {0}")]
    IpfsFetchError(String),

    #[error("DKG publish failed: {0}")]
    DkgPublishError(String),

    #[error("DKG fetch failed: {0}")]
    DkgFetchError(String),

    #[error("Serialization error: {0}")]
    SerializationError(String),

    #[error("Deserialization error: {0}")]
    DeserializationError(String),

    #[error("Cryptography error: {0}")]
    CryptoError(String),

    #[error("Access denied: {0}")]
    AccessDenied(String),

    #[error("Unknown error: {0}")]
    Unknown(String),
}
