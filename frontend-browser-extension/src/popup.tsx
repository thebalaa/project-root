import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/popup.css';  // or any additional styles

function Popup() {
  // If you have additional logic specifically for the popup,
  // you may place it here or at the App level.
  return (
    <App />
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App />)
