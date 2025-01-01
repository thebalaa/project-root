import { monitorAPIRequests } from './services/dataMonitor';
import { BrowserEvents } from './services/browserEvents';
import { DataIdentifier } from './localCache/dataIdentification';

const dataIdentifier = new DataIdentifier();
const browserEvents = new BrowserEvents(dataIdentifier);

monitorAPIRequests(); // sets up onBeforeRequest and onCompleted
browserEvents.initListeners(); // sets up the additional request listener from BrowserEvents

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FETCH_RESPONSE" || message.type === "XHR_RESPONSE") {
    console.log("Received response data:", message);
    // Save or process the response data here if you wish (e.g., chrome.storage.local.set).
  }
  sendResponse({ status: "ok" });
  return true; // Keep the message channel open if needed for async responses
});