import fastq from 'fastq'

export interface CapturedData {
    id: string;
    url: string;
    headers: Record<string, string>;
    body: any;
    timestamp: number;
    sensitiveData: boolean;
}

export class DataIdentifier {
    private queue: fastq.queue<CapturedData>;

    constructor() {
        this.queue = fastq(this.processData.bind(this), 1); // Concurrency set to 1
    }

    public identifyAndProcess(data: CapturedData): void {
        const transformedData = this.normalizeData(data);

        if (this.isCriticalData(transformedData)) {
            this.queue.push(transformedData, (err) => {
                if (err) {
                    console.error('Error processing critical data:', err);
                }
            });
        } else {
            this.queue.push(transformedData, (err) => {
                if (err) {
                    console.error('Error processing non-critical data:', err);
                }
            });
        }
    }

    private processData(data: CapturedData, callback: (err?: Error | null) => void): void {
        try {
            console.log('Processing data:', data);
            callback();
        } catch (error) {
            callback(error);
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

    private isCriticalData(data: CapturedData): boolean {
        return data.url.includes("/critical"); // Example logic for identifying critical data
    }
}
