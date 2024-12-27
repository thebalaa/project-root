import axios from 'axios';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { BackendUploader } from '../src/services/backendUploader';
import { CapturedData } from '../src/localCache/localCache';
// Mock axios
jest.mock('axios');
describe('BackendUploader', () => {
let uploader: BackendUploader;
const testEndpoint = 'http://localhost:3000/data';
const mockBatch: CapturedData[] = [
{
    id: '123',
url: 'https://example.com',
headers: { 'Content-Type': 'application/json' },
body: { foo: 'bar' },
timestamp: Date.now(),
sensitiveData: false
}
];
beforeEach(() => {
uploader = new BackendUploader(testEndpoint);
});
afterEach(() => {
    jest.clearAllMocks();
});
it('should upload data batch to the backend when data is present', async () => {
(axios.post as jest.Mock).mockResolvedValue({ status: 200 });
await uploader.upload(mockBatch);
expect(axios.post).toHaveBeenCalledTimes(1);
expect(axios.post).toHaveBeenCalledWith(testEndpoint, mockBatch, {
headers: { 'Content-Type': 'application/json' },
});
});
it('should log a message when no data is provided', async () => {
    console.log = jest.fn();
    await uploader.upload([]); // no data
    expect(console.log).toHaveBeenCalledWith('No data to upload.');
    expect(axios.post).not.toHaveBeenCalled();
    });
    it('should throw an error when the request fails', async () => {
    (axios.post as jest.Mock).mockRejectedValue(new Error('Network Error'));
    await expect(uploader.upload(mockBatch)).rejects.toThrow('Network Error');
expect(axios.post).toHaveBeenCalledTimes(1);
});
});
