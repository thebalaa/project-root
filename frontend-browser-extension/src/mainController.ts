import { sendUrlToCompanion } from './services/companionClient';

console.log('Background script (service worker) loading...');

// Listen for tab URL changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if the URL actually changed
  if (changeInfo.url && tab.active) {
    const newUrl = changeInfo.url;
    console.log(`Detected new URL: ${newUrl}`);

    // Optionally check if user enabled the "Forward URLs" feature in storage
    chrome.storage.local.get(['forwardUrlsEnabled'], async (items) => {
      const isForwardingOn = !!items.forwardUrlsEnabled;
      if (isForwardingOn) {
        await sendUrlToCompanion(newUrl);
      }
    });
  }
});

console.log('Background script finished loading.');