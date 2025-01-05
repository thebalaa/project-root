import { LocalCache } from '../../localCache/localCache';

export class Encryption {
  private static readonly ENCRYPTION_KEY = 'encryption_key';

  static async encrypt(data: string): Promise<string> {
    // Basic encryption for demo purposes
    // In production, use a proper encryption library
    return btoa(data);
  }

  static async decrypt(encryptedData: string): Promise<string> {
    // Basic decryption for demo purposes
    return atob(encryptedData);
  }

  static async getEncryptionKey(): Promise<string> {
    const profile = await LocalCache.getUserProfile();
    return profile.userId || this.ENCRYPTION_KEY;
  }
}
