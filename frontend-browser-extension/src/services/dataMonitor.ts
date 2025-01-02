import { DataIdentifier } from "../localCache/dataIdentification";

// src/services/dataMonitor.ts
export function monitorAPIRequests() {
    // Listen for outgoing requests
    chrome.webRequest.onBeforeRequest.addListener(
        (details: chrome.webRequest.WebRequestBodyDetails) => {
            console.log("Intercepted Request:", details);
            storeRequestData({
                requestHeaders: {},
                url: details.url,
                method: details.method,
                requestBody: details.requestBody,
                timeStamp: details.timeStamp,
                initiator: details.initiator,
                requestId: details.requestId
            });
        },
        {
            urls: ["<all_urls>"]
        },
        ["requestBody"]
    );

    // Inject content script to capture full response body
    chrome.webRequest.onCompleted.addListener(
        (details) => {
            injectContentScript(details.tabId, details.url);
        },
        {
            urls: ["<all_urls>"]
        }
    );
}

interface RequestDetails {
    requestHeaders: {};
    url: string;
    method: string;
    requestBody?: any; // Use 'any' as the type for requestBody since it can vary
    timeStamp: number;
    initiator?: string;
    requestId: string;
}

function storeRequestData(details: RequestDetails): void {
    let safeRequestBody: any = null;
    try {
        // Attempt to clone/JSON-ify it safely
        safeRequestBody = JSON.parse(JSON.stringify(details.requestBody));
    } catch (err) {
        console.warn('Could not stringify or store requestBody; storing null instead.', err);
        safeRequestBody = null;
    }

    const requestData = {
        url: details.url,
        method: details.method,
        requestBody: safeRequestBody,
        timeStamp: details.timeStamp,
        initiator: details.initiator || "unknown",
    };

    chrome.storage.local.set({ [`request_${details.requestId}`]: requestData }, () => {
        const error = chrome.runtime.lastError;
        if (error) {
            console.warn('Error setting request data:', error);
        } else {
            console.log("Request data saved:", requestData);

            // READ BACK EVERYTHING for debugging:
            chrome.storage.local.get(null, (items) => {
                console.log('All items in chrome.storage.local:', items);
            });
        }
    });

    // Pass the same "cleaned" body to DataIdentifier if you wish
    const dataIdentifier = new DataIdentifier();
    dataIdentifier.identifyAndProcess({
        id: '', 
        url: details.url,
        headers: details.requestHeaders || {},
        body: safeRequestBody, // pass the cleaned body
        timestamp: details.timeStamp,
        sensitiveData: false,
    });
}

function injectContentScript(tabId: number, detailsUrl: string) {
    // If the URL starts with chrome:// or chrome-extension://, skip injection
    if (detailsUrl.startsWith('chrome://') || detailsUrl.startsWith('chrome-extension://')) {
        return;
    }
    if (tabId <= 0) {
        return;
    }
    chrome.scripting.executeScript({
        target: { tabId },
        files: ["contentScript.js"]
    }, () => {
        console.log("Content script injected into tab", tabId);
    });
}
