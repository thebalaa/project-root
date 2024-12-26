// zkProofUtils.ts

/**
 * zkProofUtils.ts
 * 
 * Handles zero-knowledge proof operations and ensures that all external communications are routed through Tor.
 */

import { Logger } from 'winston';
import winston from 'winston';
import { AppError } from './errorHandler';
import { DataReference } from './type';
import { encryptWithZKP, verifyZKP } from './zkpFunctions';
import { TorClient } from './torClient';
import { DKGNodeConfig } from './config';

const logger: Logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

export async function publishDataReference(
  dataReference: DataReference,
  torClient: TorClient,
  config: DKGNodeConfig
): Promise<void> {
  try {
    // 1. Encrypt reference with ZK proof
    const { encryptedData, proof } = encryptWithZKP(dataReference);

    // 2. Prepare payload for the DKG
    const payload = {
      data_reference: encryptedData,
      zk_proof: proof
    };

    // 3. Post to the DKG
    const url = `${config.dkg.apiUrl}/publish_data_reference`;
    const response = await torClient.post<{ success: boolean; message: string }>(url, payload);

    if (!response.success) {
      throw new Error(`DataReference publishing failed: ${response.message}`);
    }
    logger.info(`DataReference published successfully with dataId: ${dataReference.data_id}`);
  } catch (error) {
    logger.error(`Failed to publish DataReference: ${(error as Error).message}`);
    throw new AppError(`Failed to publish DataReference: ${(error as Error).message}`);
  }
}

export function verifyDataReferenceZKP(dataReference: DataReference, proof: string): boolean {
  try {
    const isValid = verifyZKP(dataReference, proof);
    if (!isValid) {
      logger.warn(`ZKP verification failed for dataId: ${dataReference.data_id}`);
    } else {
      logger.info(`ZKP verification successful for dataId: ${dataReference.data_id}`);
    }
    return isValid;
  } catch (error) {
    logger.error(`Failed to verify ZKP: ${(error as Error).message}`);
    throw new AppError(`Failed to verify ZKP: ${(error as Error).message}`);
  }
}
