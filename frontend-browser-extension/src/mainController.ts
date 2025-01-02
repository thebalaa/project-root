import { DataIdentifier } from './localCache/dataIdentification';
import { monitorAPIRequests } from './services/dataMonitor';

// This background script is our single entry point
console.log('Background script is loading...');

// Create your DataIdentifier instance
const dataIdentifier = new DataIdentifier();
// If you have other references, e.g. LocalCache, do so here as well

// Option A: Use the dataMonitor approach
monitorAPIRequests(); 
// This sets up chrome.webRequest.onBeforeRequest + onCompleted to store request data and inject the content script.

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background got a message:', message);

  if (message.type === "FETCH_RESPONSE" || message.type === "XHR_RESPONSE") {
    console.log("Received response data from content script:", message);
    // e.g. store them in dataIdentifier or localCache
  }

  sendResponse({ status: "ok" });
  return true; // Keep the message channel open if needed for async
});

console.log('Background script finished loading.');