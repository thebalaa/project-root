import React, { useState } from 'react';
import { storeOrganizationSize } from '../localCache/localCache';

interface SelectOrgSizeScreenProps {
  onNext: () => void;
  onBack: () => void;
}

const SelectOrgSizeScreen: React.FC<SelectOrgSizeScreenProps> = ({ onNext, onBack }) => {
  const [size, setSize] = useState('Small');

  const handleNext = () => {
    storeOrganizationSize(size);
    onNext();
  };

  return (
    <div className="screenContainer">
      <h2>Select Organization Size</h2>
      <select value={size} onChange={(e) => setSize(e.target.value)}>
        <option value="Small">Small</option>
        <option value="Medium">Medium</option>
        <option value="Large">Large</option>
      </select>
      <div className="buttonRow">
        <button className="backButton" onClick={onBack}>Back</button>
        <button className="nextButton" onClick={handleNext}>Next</button>
      </div>
    </div>
  );
};

export default SelectOrgSizeScreen; 