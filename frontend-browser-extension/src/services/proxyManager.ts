/**
 * proxyManager.ts
 *
 * Responsible for coordinating with a local proxy companion application
 * and (optionally) setting browser proxy settings if permissions allow.
 */
 
// Type describing the local proxy configuration
interface ProxyConfig {
  host: string;
  port: number;
  enabled: boolean;
}

/**
 * Start the local proxy by:
 * 1) Attempting to connect to a local companion app via Native Messaging,
 *    sending a "startProxy" command.
 * 2) On success, optionally call chrome.proxy.settings to set 127.0.0.1:port.
 */
export async function startProxy(): Promise<void> {
  console.log('[proxyManager] Attempting to start local proxy...');
  const config: ProxyConfig = {
    host: '127.0.0.1',
    port: 8888,
    enabled: true,
  };

  // Example of Native Messaging approach:
  try {
    const response = await sendNativeMessage({ command: 'startProxy' });
    if (response.success) {
      // Use the returned port if it's dynamic
      if (response.port) {
        config.port = response.port;
      }
      console.log(`[proxyManager] Native app started proxy on port ${config.port}`);
      // (Optionally) set the browser's proxy settings if permission is available
      await setChromeProxy(config);
    } else {
      throw new Error(response.error || 'Unknown error starting proxy');
    }
  } catch (err) {
    console.error('[proxyManager] startProxy error:', err);
    throw err;
  }
}

/**
 * Stop the local proxy by:
 * 1) Sending a "stopProxy" command to the local companion app.
 * 2) Clearing the browser proxy settings if previously set.
 */
export async function stopProxy(): Promise<void> {
  console.log('[proxyManager] Attempting to stop local proxy...');
  try {
    const response = await sendNativeMessage({ command: 'stopProxy' });
    if (!response.success) {
      throw new Error(response.error || 'Unknown error stopping proxy');
    }
    // Optionally clear browser proxy settings:
    await clearChromeProxy();
  } catch (err) {
    console.error('[proxyManager] stopProxy error:', err);
    throw err;
  }
}

/**
 * If your extension has the "proxy" permission, you can programmatically set the proxy.
 * Otherwise, you might skip this and instruct users to configure their system/browser manually.
 */
async function setChromeProxy(config: ProxyConfig): Promise<void> {
  if (!chrome.proxy || !chrome.proxy.settings) {
    console.warn('[proxyManager] No "proxy" permission or chrome.proxy not available in MV3.');
    return;
  }
  return new Promise<void>((resolve) => {
    const configScript = `function FindProxyForURL(url, host) {
      return "PROXY ${config.host}:${config.port}";
    }`;
    const proxySetting = { 
      value: { mode: 'pac_script', pacScript: { data: configScript } }, 
      scope: 'regular'
    };
    chrome.proxy.settings.set(proxySetting, () => {
      console.log('[proxyManager] Browser proxy set to', config.host + ':' + config.port);
      resolve();
    });
  });
}

async function clearChromeProxy(): Promise<void> {
  if (!chrome.proxy || !chrome.proxy.settings) return;
  return new Promise<void>((resolve) => {
    chrome.proxy.settings.clear({ scope: 'regular' }, () => {
      console.log('[proxyManager] Browser proxy settings cleared.');
      resolve();
    });
  });
}

/**
 * Hypothetical Native Messaging function that sends a JSON command to the local companion app.
 * You would typically establish a port via chrome.runtime.connectNative() or similar APIs.
 */
async function sendNativeMessage(message: Record<string, unknown>): Promise<any> {
  return new Promise((resolve, reject) => {
    // Example: open a port to a native messaging host named 'com.my_company.proxy_app'
    const port = chrome.runtime.connectNative('com.my_company.proxy_app');

    port.onMessage.addListener((response) => {
      port.disconnect();
      resolve(response);
    });
    port.onDisconnect.addListener(() => {
      if (chrome.runtime.lastError) {
        // e.g. "Specified native messaging host not found"
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve({ success: false, error: 'Native app disconnected unexpectedly.' });
      }
    });

    // Send the command
    port.postMessage(message);
  });
}
