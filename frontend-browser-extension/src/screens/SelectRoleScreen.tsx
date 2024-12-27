import React, { useState } from 'react';
import { storeUserRole } from '../localCache/localCache';

interface SelectRoleScreenProps {
  onNext: () => void;
  onBack: () => void;
}

const SelectRoleScreen: React.FC<SelectRoleScreenProps> = ({ onNext, onBack }) => {
  const [role, setRole] = useState('Individual');

  const handleNext = () => {
    storeUserRole(role);
    onNext();
  };

  return (
    <div className="screenContainer">
      <h2>Select Role</h2>
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="Individual">Individual</option>
        <option value="Organization">Organization</option>
      </select>
      <div className="buttonRow">
        <button className="backButton" onClick={onBack}>Back</button>
        <button className="nextButton" onClick={handleNext}>Next</button>
      </div>
    </div>
  );
};

export default SelectRoleScreen; 