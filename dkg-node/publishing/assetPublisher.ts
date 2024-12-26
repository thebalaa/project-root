// assetPublisher.ts

/**
 * assetPublisher.ts
 * 
 * Handles the publishing of assets to the Decentralized Knowledge Graph.
 * All network communications are routed through Tor for enhanced privacy.
 */

import { TorClient } from './torClient';
import { Logger } from 'winston';
import winston from 'winston';
import fs from 'fs';
import path from 'path';
import { DataReference } from './type';
import { publishDataReference } from './zkProofUtils';
import { AppError } from './errorHandler';

// Initialize Logger
const logger: Logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ],
});

// Load Node Configuration
const configPath = path.resolve(__dirname, '../config/nodeConfig.json');
if (!fs.existsSync(configPath)) {
  logger.error(`Configuration file not found at path: ${configPath}`);
  throw new Error('Configuration file missing.');
}
const configData = fs.readFileSync(configPath, 'utf-8');
const config = JSON.parse(configData);

// Initialize Tor Client
const torClient = new TorClient(path.resolve(__dirname, '../config/nodeConfig.json'));

/**
 * Publishes an asset to the DKG.
 * 
 * @param assetData - The asset data to be published.
 * @param dataId - Unique identifier for the data.
 * @param authorizedMembers - List of authorized member public keys.
 */
export async function publishAsset(assetData: any, dataId: string, authorizedMembers: string[]): Promise<void> {
  try {
    // Prepare DataReference
    const dataReference: DataReference = {
      data_id: dataId,
      ipfs_hash: '', // To be filled after uploading to IPFS
      encrypted_keys: []
    };

    // Encrypt asset data and get encrypted symmetric keys
    // Assuming encryptAssetData is a function that handles encryption
    const { encryptedData, encryptedKeys } = await encryptAssetData(assetData, authorizedMembers);
    dataReference.ipfs_hash = await uploadToIPFS(encryptedData);
    dataReference.encrypted_keys = encryptedKeys;

    // Publish DataReference to DKG via zkProofUtils
    await publishDataReference(dataReference, torClient);
    logger.info(`Asset published successfully with dataId: ${dataId}`);
  } catch (error) {
    logger.error(`Failed to publish asset: ${error.message}`);
    throw new AppError(`Failed to publish asset: ${error.message}`);
  }
}

/**
 * Encrypts asset data using hybrid encryption.
 * 
 * @param assetData - The raw asset data.
 * @param authorizedMembers - List of authorized member public keys.
 * @returns Encrypted data and encrypted symmetric keys.
 */
async function encryptAssetData(assetData: any, authorizedMembers: string[]): Promise<{ encryptedData: string, encryptedKeys: any[] }> {
  // Placeholder: Implement actual encryption logic
  // For example, serialize assetData to JSON, then encrypt
  const serializedData = JSON.stringify(assetData);
  
  // Initialize GroupEncryption (assuming GroupEncryption is exported from utils)
  const { GroupEncryption } = require('./groupEncryption');
  const groupEncryption = new GroupEncryption(config.backend_api_url);

  // Prepare encrypted data and keys
  const encryptedPayload = groupEncryption.prepare_encrypted_data_for_storage(serializedData, authorizedMembers);
  
  return {
    encryptedData: encryptedPayload.encrypted_data,
    encryptedKeys: encryptedPayload.encrypted_keys
  };
}

/**
 * Uploads encrypted data to IPFS via backend API.
 * 
 * @param encryptedData - Hex-encoded encrypted data.
 * @returns IPFS hash.
 */
async function uploadToIPFS(encryptedData: string): Promise<string> {
  try {
    const response = await torClient.post(`${config.ipfs.apiUrl}/api/v0/add`, { file: encryptedData });
    if (response && response.Hash) {
      logger.info(`Data uploaded to IPFS with hash: ${response.Hash}`);
      return response.Hash;
    } else {
      throw new Error('Invalid IPFS response.');
    }
  } catch (error) {
    logger.error(`IPFS upload failed: ${error.message}`);
    throw new AppError(`IPFS upload failed: ${error.message}`);
  }
}
