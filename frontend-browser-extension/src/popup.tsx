import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

function Popup() {
  const [proxyEnabled, setProxyEnabled] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    // On mount, read 'proxyEnabled' from local storage
    chrome.storage.local.get(['proxyEnabled'], (result) => {
      setProxyEnabled(!!result.proxyEnabled);
    });
  }, []);

  function handleToggle() {
    // If currently disabled and user toggles on => enable
    if (!proxyEnabled) {
      chrome.runtime.sendMessage({ command: 'enableProxy' }, (response) => {
        console.log('enableProxy response:', response);
        if (response.status === 'ok') {
          setProxyEnabled(true);
          setStatus(response.message || '');
        } else {
          setStatus(`Error: ${response.error || 'unknown'}`);
        }
      });
    } else {
      // If currently enabled and user toggles off => disable
      chrome.runtime.sendMessage({ command: 'disableProxy' }, (response) => {
        console.log('disableProxy response:', response);
        if (response.status === 'ok') {
          setProxyEnabled(false);
          setStatus(response.message || '');
        } else {
          setStatus(`Error: ${response.error || 'unknown'}`);
        }
      });
    }
  }

  return (
    <div style={{ padding: '10px', width: '200px' }}>
      <h3>Local Proxy</h3>
      <label>
        <input
          type="checkbox"
          checked={proxyEnabled}
          onChange={handleToggle}
        />
        Enable Proxy
      </label>
      {status && <p>{status}</p>}
    </div>
  );
}

ReactDOM.render(<Popup />, document.getElementById('root'));
