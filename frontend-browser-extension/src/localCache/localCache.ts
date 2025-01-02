import { CapturedData } from './dataIdentification';

/**
 * LocalCache now uses chrome.storage.local for storage
 * instead of an in-memory Map.
 */
export class LocalCache {
  constructor() {
    // No internal map needed—everything is in chrome.storage.
  }

  /**
   * Saves or updates a CapturedData entry in chrome.storage,
   * keyed by the data.id property.
   */
  public saveToCache(data: CapturedData): void {
    const key = `captured_${data.id}`;
    chrome.storage.local.set({ [key]: data }, () => {
      if (chrome.runtime.lastError) {
        console.warn('Error saving to chrome.storage:', chrome.runtime.lastError);
      } else {
        console.log(`Saved data under key: ${key}`, data);
      }
    });
  }

  /**
   * Retrieves a CapturedData entry by id from chrome.storage.
   * Callback approach: you can revise to return a Promise if desired.
   */
  public getFromCache(id: string, callback: (result?: CapturedData) => void): void {
    const key = `captured_${id}`;
    chrome.storage.local.get(key, (items) => {
      if (chrome.runtime.lastError) {
        console.warn('Error reading from chrome.storage:', chrome.runtime.lastError);
        callback(undefined);
      } else {
        callback(items[key] as CapturedData);
      }
    });
  }

  /**
   * Retrieves all CapturedData from chrome.storage.
   * Again, callback-based (or change to a Promise if you prefer).
   */
  public getAllData(callback: (results: CapturedData[]) => void): void {
    chrome.storage.local.get(null, (items) => {
      if (chrome.runtime.lastError) {
        console.warn('Error reading all data from chrome.storage:', chrome.runtime.lastError);
        callback([]);
        return;
      }
      // Filter to only those that match our key prefix if needed
      const dataArray: CapturedData[] = [];
      Object.keys(items).forEach((key) => {
        if (key.startsWith('captured_')) {
          dataArray.push(items[key] as CapturedData);
        }
      });
      callback(dataArray);
    });
  }

  /**
   * Cleans up sensitive data from chrome.storage.local
   * by removing entries that have sensitiveData === true.
   */
  public cleanUpSensitiveData(): void {
    // 1) Get all items
    chrome.storage.local.get(null, (items) => {
      if (chrome.runtime.lastError) {
        console.warn('Error reading local storage in cleanUpSensitiveData:', chrome.runtime.lastError);
        return;
      }

      // 2) Determine which keys to remove
      const keysToRemove: string[] = [];
      for (const [key, value] of Object.entries(items)) {
        // Look only at keys that match our "captured_" prefix
        if (key.startsWith('captured_') && (value as CapturedData).sensitiveData) {
          keysToRemove.push(key);
        }
      }

      // 3) Remove them
      if (keysToRemove.length > 0) {
        chrome.storage.local.remove(keysToRemove, () => {
          if (chrome.runtime.lastError) {
            console.warn('Error removing sensitive data:', chrome.runtime.lastError);
          } else {
            console.log('Removed sensitive data for keys:', keysToRemove);
          }
        });
      }
    });
  }

  /**
   * Clears the entire extension storage or just the captured_ keys.
   * If you only want to remove captured data, filter for the "captured_" prefix.
   */
  public clearCache(): void {
    // If you really want to remove everything in chrome.storage.local:
    /*
    chrome.storage.local.clear(() => {
      if (chrome.runtime.lastError) {
        console.warn('Error clearing storage:', chrome.runtime.lastError);
      } else {
        console.log('All chrome.storage.local data cleared.');
      }
    });
    */

    // Or remove only keys that start with "captured_":
    chrome.storage.local.get(null, (items) => {
      if (chrome.runtime.lastError) {
        console.warn('Error reading storage in clearCache:', chrome.runtime.lastError);
        return;
      }
      const keysToRemove = Object.keys(items).filter(k => k.startsWith('captured_'));
      if (keysToRemove.length > 0) {
        chrome.storage.local.remove(keysToRemove, () => {
          if (chrome.runtime.lastError) {
            console.warn('Error clearing captured data:', chrome.runtime.lastError);
          } else {
            console.log('Cleared captured data for keys:', keysToRemove);
          }
        });
      }
    });
  }
}

// Re-exporting the interface to keep references consistent
export { CapturedData };

// Example additions to localCache
// These remain in window.localStorage; if you prefer, you can also store them in chrome.storage as well.
export function storeLoginDetails(username: string, password: string) {
  // For demonstration only – DO NOT store passwords in plain text.
  localStorage.setItem('username', username);
  localStorage.setItem('password', password);
}

export function storeUserRole(role: string) {
  localStorage.setItem('userRole', role);
}

export function storeOrganizationSize(size: string) {
  localStorage.setItem('organizationSize', size);
}

export function storeIndustry(industry: string) {
  localStorage.setItem('industry', industry);
}
