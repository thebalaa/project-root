import React from 'react';
import { linkDevice } from '../services/deviceLinkerService';

interface DeviceLinkerScreenProps {
  onNext: () => void;
  onBack: () => void;
}

const DeviceLinkerScreen: React.FC<DeviceLinkerScreenProps> = ({ onNext, onBack }) => {
  const handleLink = () => {
    // Some logic to link device
    linkDevice();
    onNext();
  };

  return (
    <div className="screenContainer">
      <h2>Device Linker</h2>
      <p>Link this device to your account by pressing the button below.</p>
      <div className="buttonRow">
        <button className="backButton" onClick={onBack}>Back</button>
        <button className="nextButton" onClick={handleLink}>Link Device</button>
      </div>
    </div>
  );
};

export default DeviceLinkerScreen; 