function cleanupOldData() {
    chrome.storage.local.get(null, (items) => {
        const now = Date.now();
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

        Object.keys(items).forEach((key) => {
            const item = items[key];
            if (item.timeStamp && now - item.timeStamp > maxAge) {
                chrome.storage.local.remove(key, () => {
                    console.log(`Removed stale data: ${key}`);
                });
            }
        });
    });
}

// Run cleanup periodically
setInterval(cleanupOldData, 24 * 60 * 60 * 1000); // Every 24 hours
