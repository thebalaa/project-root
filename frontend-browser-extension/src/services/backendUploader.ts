import axios from 'axios';
import { CapturedData } from '../localCache/localCache';

export class BackendUploader {
  private ingestionEndpoint: string;

  constructor(ingestionEndpoint: string) {
    this.ingestionEndpoint = ingestionEndpoint;
  }

  /**
   * Responsible for uploading data to the backend.
   */
  public async upload(dataBatch: CapturedData[]): Promise<void> {
    if (dataBatch.length === 0) {
      console.log("No data to upload.");
      return;
    }

    try {
      await axios.post(this.ingestionEndpoint, dataBatch, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(`Uploaded ${dataBatch.length} items to backend.`);
    } catch (error) {
      console.error('Error uploading data to backend:', error);
      throw error;
    }
  }
}