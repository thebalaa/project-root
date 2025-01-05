/**
 * Handles communication with the local companion app
 */

export interface CompanionResponse {
  page_id: number;
  message: string;
}

export class CompanionClient {
  private baseUrl = 'http://127.0.0.1:5000';

  /**
   * Send a URL to the companion app for processing
   */
  async sendUrl(url: string): Promise<CompanionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/process-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send URL: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending URL to companion:', error);
      throw error;
    }
  }

  /**
   * Check if the companion app is running
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
