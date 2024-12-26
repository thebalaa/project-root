import { ConfigManager } from './config';
import { GroupEncryption } from './groupEncryption';
import { EncryptedSymmetricKey } from './type';

export async function encryptDataForGroup(
  assetData: object,
  authorizedMembers: string[]
): Promise<{ encryptedData: string; encryptedKeys: EncryptedSymmetricKey[] }> {
  const config = ConfigManager.getConfig();
  const groupEncryption = new GroupEncryption(config.dkg.apiUrl);

  const serializedData = JSON.stringify(assetData);
  const payload = groupEncryption.prepare_encrypted_data_for_storage(serializedData, authorizedMembers);

  return {
    encryptedData: payload.encrypted_data,
    encryptedKeys: payload.encrypted_keys
  };
}