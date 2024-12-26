import { DataIdentifier } from '../localCache/dataIdentification';

export class BrowserEvents {
  constructor(private dataIngestion: DataIdentifier) {}

  public initListeners(): void {
    chrome.webRequest.onBeforeRequest.addListener(
      (details) => {
        console.log("Intercepted Request:", details);
        this.dataIngestion.identifyAndProcess({
          id: '',        // will be generated internally
          url: details.url,
          headers: {},
          body: details.requestBody,
          timestamp: Date.now(),
          sensitiveData: false, // detection will happen in the dataIdentifier
        });
      },
      { urls: ["<all_urls>"] },
      ["requestBody"]
    );

    // etc...
  }
}