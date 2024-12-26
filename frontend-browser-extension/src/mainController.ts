import { DataIdentifier } from './localCache/dataIdentification';
import { LocalCache } from './localCache/localCache';
import { BackendUploader } from './services/backendUploader';
import { encryptData, generateKey } from './encryption/src/encryption';

(async function initApp() {
  const dataIdentifier = new DataIdentifier();
  const localCache = new LocalCache();
  const backendUploader = new BackendUploader('http://localhost:3000/data');

  // Example: generate a local AES key for encryption
  const cryptoKey = await generateKey();

  // Configure the ingestion pipeline
  dataIdentifier.setCallback(async (captured: any) => {
    // E.g., you might want to encrypt the JSON data
    const encryptedJson = await encryptData(JSON.stringify(captured), cryptoKey);
    
    // Build a new object for storing
    const storedData = {
      ...captured,
      body: encryptedJson, // store encrypted content
    };
    localCache.saveToCache(storedData);
  });

  // Some periodic or manual trigger to upload data
  async function syncToBackend() {
    const batchedData = localCache.getAllData();
    if (batchedData.length === 0) return;

    try {
      await backendUploader.upload(batchedData);
      localCache.clearCache();
    } catch (err) {
      console.error('Upload failed, data remains cached:', err);
    }
  }

  // Possibly call syncToBackend() on an interval or user action
  setInterval(syncToBackend, 60000); // e.g., every minute
})();