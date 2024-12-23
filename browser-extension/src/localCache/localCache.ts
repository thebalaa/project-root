import axios from 'axios';
import { CapturedData } from './dataIdentification';

export class LocalCache {
    private cache: Map<string, CapturedData>;
    private ingestionEndpoint: string;

    constructor(ingestionEndpoint: string) {
        this.cache = new Map<string, CapturedData>();
        this.ingestionEndpoint = ingestionEndpoint; // Backend URL
    }

    public saveToCache(data: CapturedData): void {
        this.cache.set(data.id, data);
    }

    public getFromCache(id: string): CapturedData | undefined {
        return this.cache.get(id);
    }

    public async uploadToBackend(): Promise<void> {
        const batchedData = Array.from(this.cache.values());
        if (batchedData.length === 0) {
            console.log("No data to upload.");
            return;
        }

        try {
            await axios.post(this.ingestionEndpoint, batchedData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log(`Uploaded ${batchedData.length} items to backend.`);
            this.cache.clear(); // Clear cache after successful upload
        } catch (error) {
            console.error('Error uploading data to backend:', error);
        }
    }

    public cleanUpSensitiveData(): void {
        for (const [key, value] of this.cache.entries()) {
            if (value.sensitiveData) {
                this.cache.delete(key);
            }
        }
    }
}
