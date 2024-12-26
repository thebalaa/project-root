import fastq from 'fastq'
import { IDataIngestion } from '../interfaces/IDataIngestion'

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
    private handleData(data: CapturedData, callback: (err?: Error | null) => void): void {
        try {
            // After final transformation/detection, pass data forward
            console.log('DataIdentifier handling data:', data);
            
            if (this.onProcessedCallback) {
                this.onProcessedCallback(data);
            }

            callback();
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
        const sensitiveKeywords = ["password", "credit card"];
        return sensitiveKeywords.some(keyword => JSON.stringify(data.body).includes(keyword));
    }
}
