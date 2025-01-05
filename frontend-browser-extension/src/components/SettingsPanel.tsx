import React from 'react';
import { UserSettings } from '../services/storageService';

interface SettingsPanelProps {
  settings: UserSettings;
  onToggleForwarding: (enabled: boolean) => void;
  companionStatus: 'checking' | 'online' | 'offline';
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onToggleForwarding,
  companionStatus
}) => {
  return (
    <div className="settings-panel">
      <label className="toggle-control">
        <input
          type="checkbox"
          checked={settings.forwardUrlsEnabled}
          onChange={(e) => onToggleForwarding(e.target.checked)}
          disabled={companionStatus !== 'online'}
        />
        <span>Enable Data Collection</span>
      </label>
    </div>
  );
}; 