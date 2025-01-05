import { CompanionClient } from '../src/services/companionClient';
import fetchMock from 'jest-fetch-mock';

describe('CompanionClient', () => {
  let client: CompanionClient;

  beforeEach(() => {
    fetchMock.resetMocks();
    client = new CompanionClient('http://127.0.0.1:5000');
  });

  it('should successfully send URL to companion', async () => {
    const mockResponse = { page_id: 123, message: 'Success' };
    fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

    const response = await client.sendUrl('https://example.com');
    expect(response).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:5000/scrape',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ url: 'https://example.com' })
      })
    );
  });

  it('should handle companion app errors', async () => {
    fetchMock.mockRejectOnce(new Error('Connection failed'));
    await expect(client.sendUrl('https://example.com')).rejects.toThrow();
  });

  it('should check companion health status', async () => {
    fetchMock.mockResponseOnce('', { status: 200 });
    const isHealthy = await client.checkHealth();
    expect(isHealthy).toBe(true);
  });
}); 