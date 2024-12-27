import React from 'react';

interface StatusViewScreenProps {
  onBack: () => void;
}

const StatusViewScreen: React.FC<StatusViewScreenProps> = ({ onBack }) => {
  return (
    <div className="screenContainer">
      <h2>Status View</h2>
      <p>Here you can see all your linked devices, role, industry, etc.</p>
      <button className="backButton" onClick={onBack}>Back</button>
    </div>
  );
};

export default StatusViewScreen; 