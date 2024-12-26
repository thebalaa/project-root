import { CapturedData } from './dataIdentification';

/**
 * LocalCache is now focused solely on in-memory storage (or potentially 
 * other local storage, if needed). Upload or network operations 
 * are handled elsewhere.
 */
export class LocalCache {
  private cache: Map<string, CapturedData>;

  constructor() {
    this.cache = new Map<string, CapturedData>();
  }

  public saveToCache(data: CapturedData): void {
    // Overwrite or store new data
    this.cache.set(data.id, data);
  }

  public getFromCache(id: string): CapturedData | undefined {
    return this.cache.get(id);
  }

  public getAllData(): CapturedData[] {
    return Array.from(this.cache.values());
  }

  /**
   * Cleans up sensitive data from the cache. 
   * This is local memory, so no encryption needed here.
   */
  public cleanUpSensitiveData(): void {
    for (const [key, value] of this.cache.entries()) {
      if (value.sensitiveData) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clears entire cache after successful upload or other reasons.
   */
  public clearCache(): void {
    this.cache.clear();
  }
}

// Re-exporting the interface to keep references consistent
export { CapturedData };
