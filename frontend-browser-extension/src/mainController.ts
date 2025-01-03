import { DataIdentifier } from './localCache/dataIdentification';
import { startProxy, stopProxy } from './services/proxyManager';

// This background script is our single entry point
console.log('Background script is loading...');

// Create your DataIdentifier instance
const dataIdentifier = new DataIdentifier();
// If you have other references, e.g. LocalCache, do so here as well

// Instead, on startup, read 'proxyEnabled' from storage
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['proxyEnabled'], (result) => {
    const isEnabled = !!result.proxyEnabled;
    console.log('Extension installed; proxyEnabled in storage =', isEnabled);
    if (isEnabled) {
      startProxy()
        .catch(err => console.warn('Failed to start proxy on install', err));
    }
  });
});

// Also check on service worker activation
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(['proxyEnabled'], (result) => {
    const isEnabled = !!result.proxyEnabled;
    console.log('Extension startup; proxyEnabled in storage =', isEnabled);
    if (isEnabled) {
      startProxy()
        .catch(err => console.warn('Failed to start proxy on startup', err));
    }
  });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background got a message:', message);

  // The popup (or other parts of the extension) might send commands:
  if (message.command === 'enableProxy') {
    chrome.storage.local.set({ proxyEnabled: true }, () => {
      startProxy()
        .then(() => {
          sendResponse({ status: 'ok', message: 'Proxy enabled.' });
        })
        .catch(err => {
          sendResponse({ status: 'error', error: err.toString() });
        });
    });
    return true; // keep message channel open for async response
  }

  if (message.command === 'disableProxy') {
    chrome.storage.local.set({ proxyEnabled: false }, () => {
      stopProxy()
        .then(() => {
          sendResponse({ status: 'ok', message: 'Proxy disabled.' });
        })
        .catch(err => {
          sendResponse({ status: 'error', error: err.toString() });
        });
    });
    return true; // keep message channel open for async response
  }

  sendResponse({ status: 'unhandled' });
  return false;
});

console.log('Background script finished loading.');