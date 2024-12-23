import { CapturedData } from './dataIdentification';

export class LocalCache {
    private cache: Map<string, CapturedData>;

    constructor() {
        this.cache = new Map<string, CapturedData>();
    }

    public saveToCache(data: CapturedData): void {
        this.cache.set(data.id, data);
    }

    public getFromCache(id: string): CapturedData | undefined {
        return this.cache.get(id);
    }

    public batchUpload(): CapturedData[] {
        const batchedData = Array.from(this.cache.values());
        this.cache.clear(); // Clear cache after batching
        return batchedData;
    }

    public cleanUpSensitiveData(): void {
        for (const [key, value] of this.cache.entries()) {
            if (value.sensitiveData) {
                this.cache.delete(key);
            }
        }
    }
}
