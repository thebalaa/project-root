import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

function Popup() {
  const [isForwardingOn, setIsForwardingOn] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(['forwardUrlsEnabled'], (res) => {
      setIsForwardingOn(!!res.forwardUrlsEnabled);
    });
  }, []);

  const toggleForwarding = () => {
    const nextState = !isForwardingOn;
    setIsForwardingOn(nextState);
    chrome.storage.local.set({ forwardUrlsEnabled: nextState }, () => {
      console.log('Forwarding state updated:', nextState);
    });
  };

  return (
    <div style={{ padding: '1rem', width: '220px' }}>
      <h2>Forward Visited URLs</h2>
      <label>
        <input
          type="checkbox"
          checked={isForwardingOn}
          onChange={toggleForwarding}
        />
        Enable forwarding
      </label>
    </div>
  );
}

ReactDOM.render(<Popup />, document.getElementById('root'));
