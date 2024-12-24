// src/services/apiMonitor.ts
export function monitorAPIRequests() {
    // Listen for outgoing requests
    chrome.webRequest.onBeforeRequest.addListener(
        (details) => {
            console.log("Intercepted Request:", details);
            storeRequestData(details);
        },
        {
            urls: ["<all_urls>"]
        },
        ["requestBody"]
    );

    // Inject content script to capture full response body
    chrome.webRequest.onCompleted.addListener(
        (details) => {
            injectContentScript(details.tabId);
        },
        {
            urls: ["<all_urls>"]
        }
    );
}

interface RequestDetails {
    url: string;
    method: string;
    requestBody?: any; // Use 'any' as the type for requestBody since it can vary
    timeStamp: number;
    initiator?: string;
    requestId: string;
}

function storeRequestData(details: RequestDetails): void {
    const requestData = {
        url: details.url,
        method: details.method,
        requestBody: details.requestBody || null, // Handle cases where there is no request body
        timeStamp: details.timeStamp,
        initiator: details.initiator || "unknown", // Capture the initiator of the request
    };

    chrome.storage.local.set({ [`request_${details.requestId}`]: requestData }, () => {
        console.log("Request data saved:", requestData);
    });
};

function injectContentScript(tabId: number) {
    if (tabId > 0) {
        chrome.scripting.executeScript({
            target: { tabId },
            files: ["contentScript.js"]
        }, () => {
            console.log("Content script injected into tab", tabId);
        });
    }
}
