// zkProofUtils.ts

/**
 * zkProofUtils.ts
 * 
 * Handles zero-knowledge proof operations and ensures that all external communications are routed through Tor.
 */

import { TorClient } from './torClient';
import { Logger } from 'winston';
import winston from 'winston';
import fs from 'fs';
import path from 'path';
import { AppError } from './errorHandler';
import { DataReference } from './type';
import { encryptWithZKP, verifyZKP } from './zkpFunctions';

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
 * Publishes a DataReference with zero-knowledge proof to the DKG.
 * 
 * @param dataReference - The DataReference object to publish.
 */
export async function publishDataReference(dataReference: DataReference): Promise<void> {
  try {
    // Encrypt DataReference with ZKP
    const { encryptedData, proof } = encryptWithZKP(dataReference);
    
    // Prepare payload with encrypted data and proof
    const payload = {
      data_reference: encryptedData,
      zk_proof: proof
    };

    // Send payload to DKG via backend API through Tor
    const url = `${config.dkg.apiUrl}/publish_data_reference`;
    const response = await torClient.post(url, payload);
    
    if (response.success) {
      logger.info(`DataReference published successfully with dataId: ${dataReference.data_id}`);
    } else {
      throw new Error('DataReference publishing failed.');
    }
  } catch (error) {
    logger.error(`Failed to publish DataReference: ${error.message}`);
    throw new AppError(`Failed to publish DataReference: ${error.message}`);
  }
}

/**
 * Verifies the zero-knowledge proof associated with a DataReference.
 * 
 * @param dataReference - The DataReference object to verify.
 * @param proof - The zero-knowledge proof to verify.
 * @returns Boolean indicating whether the proof is valid.
 */
export function verifyDataReferenceZKP(dataReference: DataReference, proof: string): boolean {
  try {
    const isValid = verifyZKP(dataReference, proof);
    if (isValid) {
      logger.info(`ZKP verification successful for dataId: ${dataReference.data_id}`);
    } else {
      logger.warn(`ZKP verification failed for dataId: ${dataReference.data_id}`);
    }
    return isValid;
  } catch (error) {
    logger.error(`Failed to verify ZKP: ${error.message}`);
    throw new AppError(`Failed to verify ZKP: ${error.message}`);
  }
}
