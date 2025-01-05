import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { StorageService, UserSettings } from './services/storageService';
import { SettingsPanel } from './components/SettingsPanel';
import './styles/popup.css';

function Popup() {
  const [settings, setSettings] = useState<UserSettings>({
    forwardUrlsEnabled: false,
    preferences: {
      dataCollection: {
        enabled: false,
        types: []
      }
    }
  });
  const [companionStatus, setCompanionStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const loadSettings = async () => {
      const userSettings = await StorageService.getUserSettings();
      setSettings(userSettings);
    };

    loadSettings();
    checkCompanionStatus();
  }, []);

  const checkCompanionStatus = () => {
    chrome.runtime.sendMessage({ type: 'CHECK_COMPANION' }, (response) => {
      setCompanionStatus(response?.isHealthy ? 'online' : 'offline');
    });
  };

  const handleToggleForwarding = async (enabled: boolean) => {
    const updatedSettings: UserSettings = {
      ...settings,
      forwardUrlsEnabled: enabled,
      preferences: {
        dataCollection: {
          enabled,
          types: settings.preferences?.dataCollection?.types || []
        }
      }
    };
    
    await StorageService.updateUserSettings(updatedSettings);
    setSettings(updatedSettings);
  };

  return (
    <div className="popup-container">
      <h2>Web Data Collector</h2>
      <div className="status-indicator">
        Companion Status: <span className={`status-${companionStatus}`}>{companionStatus.toUpperCase()}</span>
      </div>
      <SettingsPanel
        settings={settings}
        onToggleForwarding={handleToggleForwarding}
        companionStatus={companionStatus}
      />
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<Popup />);
