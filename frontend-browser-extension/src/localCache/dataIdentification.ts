import fastq from 'fastq'
import { IDataIngestion } from '../interfaces/iProxyConfig'

export interface CapturedData {
    id: string;
    url: string;
    headers: Record<string, string>;
    body: any;
    timestamp: number;
    sensitiveData: boolean;
}

export class DataIdentifier implements IDataIngestion {
    private queue: fastq.queue<CapturedData>;
    private onProcessedCallback?: (data: CapturedData) => void;

    constructor() {
        this.queue = fastq(this.handleData.bind(this), 1); // Concurrency set to 1
    }

    /**
     * Primary entry point for external calls to process data.
     */
    public identifyAndProcess(data: CapturedData): void {
        const transformedData = this.normalizeData(data);
        this.queue.push(transformedData, (err) => {
            if (err) {
                console.error('Error processing data:', err);
            }
        });
    }

    /**
     * Allows an external module (e.g., local cache or encryption) 
     * to receive the finalized CapturedData once processed.
     */
    public setCallback(callback: (data: CapturedData) => void): void {
        this.onProcessedCallback = callback;
    }

    /**
     * The internal function that runs for each item in the queue.
     */
    private handleData(data: CapturedData, callback: (err: Error | null) => void): void {
        try {
            // After final transformation/detection, pass data forward
            console.log('DataIdentifier handling data:', data);
            
            if (this.onProcessedCallback) {
                this.onProcessedCallback(data);
            }

            callback(null); // Explicitly pass null when there's no error
        } catch (error) {
            callback(error as Error);
        }
    }

    private normalizeData(data: CapturedData): CapturedData {
        return {
            ...data,
            id: this.generateUniqueId(data),
            sensitiveData: this.detectSensitiveData(data),
        };
    }

    private generateUniqueId(data: CapturedData): string {
        return `${data.url}-${data.timestamp}`; // Example unique ID generation
    }

    private detectSensitiveData(data: CapturedData): boolean {
        let bodyString = '';
        try {
            // data.body might be FormData, an ArrayBuffer, or something else that JSON.stringify won't handle well.
            // Convert safely, or skip if it fails.
            if (data.body !== undefined) {
                bodyString = JSON.stringify(data.body);
            }
        } catch (e) {
            console.warn('Failed to stringify request body in detectSensitiveData()', e);
            // If stringification fails, just skip checking for sensitive data:
            bodyString = '';
        }

        const sensitiveKeywords = ["password", "credit card"];
        return sensitiveKeywords.some(keyword => bodyString.includes(keyword));
    }
}
