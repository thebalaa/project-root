import { describe, it, beforeEach, afterEach, expect, jest } from '@jest/globals';
import { DataIdentifier } from '../src/localCache/dataIdentification';
import { BrowserEvents } from '../src/services/browserEvents';
// Mock the chrome API for testing environment
declare const global: any;
global.chrome = {
webRequest: {
onBeforeRequest: {
addListener: jest.fn()
}
}
};
describe('Data Monitoring & Collection', () => {
let dataIdentifier: DataIdentifier;
let browserEvents: BrowserEvents;
beforeEach(() => {
dataIdentifier = new DataIdentifier();
jest.spyOn(dataIdentifier, 'identifyAndProcess'); // to track calls
browserEvents = new BrowserEvents(dataIdentifier);
});
afterEach(() => {
jest.clearAllMocks();
});
it('should initialize webRequest listener for data ingestion', () => {
// Initialize the listeners
browserEvents.initListeners();
// Expect that chrome.webRequest.onBeforeRequest.addListener is called
expect(global.chrome.webRequest.onBeforeRequest.addListener).toHaveBeenCalledTimes(1);
});
it('should call identifyAndProcess when a request is intercepted', () => {
    browserEvents.initListeners();
    // Simulate a request detail that would trigger the onBeforeRequest listener
    const listenerCallback = global.chrome.webRequest.onBeforeRequest.addListener.mock.calls[0][0];
    const mockRequestDetails = {
    url: 'https://example.com',
    requestBody: { formData: { key: 'value' } }
    };
    listenerCallback(mockRequestDetails);
    // Check that identifyAndProcess was called with the request details
    expect(dataIdentifier.identifyAndProcess).toHaveBeenCalledTimes(1);
expect(dataIdentifier.identifyAndProcess).toHaveBeenCalledWith({
id: '',
url: 'https://example.com',
headers: {},
body: { formData: { key: 'value' } },
timestamp: expect.any(Number),
sensitiveData: false
});
});
});
    