(function() {
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const response = await originalFetch(...args);
        const clonedResponse = response.clone();
        const responseBody = await clonedResponse.text();

        const headersArray: [string, string][] = [];
        clonedResponse.headers.forEach((value, key) => {
            headersArray.push([key, value]);
        });

        chrome.runtime.sendMessage({
            type: 'FETCH_RESPONSE',
            url: clonedResponse.url,
            status: clonedResponse.status,
            body: responseBody,
            headers: Object.fromEntries(headersArray), // Capture headers for context
        });

        return response;
    };

    const originalXHR = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(...args) {
        this.addEventListener('load', function() {
            chrome.runtime.sendMessage({
                type: 'XHR_RESPONSE',
                url: this.responseURL,
                status: this.status,
                body: this.responseText,
                headers: this.getAllResponseHeaders(), // Capture headers for context
            });
        });
        originalXHR.apply(this, args);
    };
})();
