import { TorClient } from './torClient';
import { DKGNodeConfig } from './config';
import { AppError } from './errorHandler';

interface IpfsAddResponse {
  Hash: string;
}

export async function uploadToIpfs(
  encryptedData: string,
  torClient: TorClient,
  config: DKGNodeConfig
): Promise<string> {
  try {
    // IPFS HTTP API call: /api/v0/add
    // This might require form-data if the IPFS node doesn’t accept JSON
    // For demonstration, assume it accepts JSON directly
    const response: IpfsAddResponse = await torClient.post(`${config.ipfs.apiUrl}/api/v0/add`, {
      file: encryptedData
    });
    if (!response || !response.Hash) {
      throw new Error('Invalid IPFS response.');
    }
    return response.Hash;
  } catch (error) {
    throw new AppError(`IPFS upload failed: ${(error as Error).message}`);
  }
}