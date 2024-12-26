// assetPublisher.ts

/**
 * assetPublisher.ts
 * 
 * Handles the publishing of assets to the Decentralized Knowledge Graph.
 * All network communications are routed through Tor for enhanced privacy.
 */

import { Logger } from 'winston';
import winston from 'winston';
import { ConfigManager } from './config';
import { TorClient } from './torClient';
import { DataReference, EncryptedSymmetricKey } from './type';
import { AppError } from './errorHandler';
import { encryptDataForGroup } from './encryptionUtils';
import { uploadToIpfs } from './ipfsUtils';
import { publishDataReference } from './zkProofUtils';

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

export async function publishAsset(
  assetData: object,
  dataId: string,
  authorizedMembers: string[]
): Promise<void> {
  try {
    const config = ConfigManager.getConfig();
    const torClient = new TorClient(config);

    // 1. Encrypt the asset data for group members
    const { encryptedData, encryptedKeys } = await encryptDataForGroup(assetData, authorizedMembers);

    // 2. Upload the encrypted data to IPFS
    const ipfsHash = await uploadToIpfs(encryptedData, torClient, config);

    // 3. Prepare the DataReference
    const dataReference: DataReference = {
      data_id: dataId,
      ipfs_hash: ipfsHash,
      encrypted_keys: encryptedKeys as EncryptedSymmetricKey[]
    };

    // 4. Publish DataReference to the DKG
    await publishDataReference(dataReference, torClient, config);
    logger.info(`Asset published successfully with dataId: ${dataId}`);
  } catch (error) {
    logger.error(`Failed to publish asset: ${(error as Error).message}`);
    throw new AppError(`Failed to publish asset: ${(error as Error).message}`);
  }
}
