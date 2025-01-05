import React, { useState } from 'react';
import { LocalCache } from '../localCache/localCache';

interface SelectOrgSizeScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export const SelectOrgSizeScreen: React.FC<SelectOrgSizeScreenProps> = ({ onNext, onBack }) => {
  const [orgSize, setOrgSize] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await LocalCache.saveUserProfile({ orgSize });
    onNext();
  };

  return (
    <div className="screenContainer">
      <h2>Organization Size</h2>
      <form onSubmit={handleSubmit}>
        <div className="inputGroup">
          <label htmlFor="orgSize">Number of Employees</label>
          <select
            id="orgSize"
            value={orgSize}
            onChange={(e) => setOrgSize(e.target.value)}
            required
          >
            <option value="">Select...</option>
            <option value="1-10">1-10</option>
            <option value="11-50">11-50</option>
            <option value="51-200">51-200</option>
            <option value="201-1000">201-1000</option>
            <option value="1000+">1000+</option>
          </select>
        </div>
        <div className="buttonRow">
          <button type="button" className="backButton" onClick={onBack}>Back</button>
          <button type="submit" className="nextButton">Next</button>
        </div>
      </form>
    </div>
  );
}; 