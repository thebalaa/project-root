import { CompanionClient } from './services/companionClient';

const companion = new CompanionClient();

// Track processed URLs to avoid duplicates
const processedUrls = new Set<string>();

/**
 * Helper function to wrap chrome.storage.local.get in a Promise.
 */
function getLocalStorageItem<T>(key: string): Promise<T | undefined> {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key]);
    });
  });
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // First check tab activity
  if (!tab.active) {
    return;
  }

  // Then ensure changeInfo.url is actually a string (and not undefined)
  if (typeof changeInfo.url !== 'string') {
    return;
  }

  // At this point, TypeScript knows changeInfo.url is a string (no longer string | undefined)
  const url = changeInfo.url;

  // Skip if we've already processed this URL.
  if (processedUrls.has(url)) {
    return;
  }

  try {
    // Retrieve forwardUrlsEnabled from extension storage via our helper.
    const forwardUrlsEnabled = await getLocalStorageItem<boolean>('forwardUrlsEnabled');

    // If the extension user has enabled forwarding, send URL to the local companion app.
    if (forwardUrlsEnabled) {
      const response = await companion.sendUrl(url);
      console.log('URL processed:', url, 'Page ID:', response.page_id);
      processedUrls.add(url);

      // Limit our processed cache size to 1000.
      if (processedUrls.size > 1000) {
        const iterator = processedUrls.values();  // returns an Iterator<string>
        const nextItem = iterator.next();         // returns { value?: string; done: boolean }
      
        if (!nextItem.done && nextItem.value) {
          // Now TypeScript knows nextItem.value must be a string
          processedUrls.delete(nextItem.value);
        }
      }
    }
  } catch (error) {
    console.error('Failed to process URL:', url, error);
  }
});

// Listen for messages from popup (e.g., checking whether companion app is healthy).
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHECK_COMPANION') {
    companion.checkHealth()
      .then(isHealthy => sendResponse({ isHealthy }))
      .catch(() => sendResponse({ isHealthy: false }));
    return true; // Keep channel open for async response.
  }
});
