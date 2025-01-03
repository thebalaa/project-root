  chrome.webRequest.onBeforeRequest.addListener(
      (details) => {
          console.log("Intercepted Request:", details);
          // ...
      },
      {
          urls: ["<all_urls>"]
      },
      ["requestBody"]
  );