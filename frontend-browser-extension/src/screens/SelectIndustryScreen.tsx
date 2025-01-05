import React, { useState } from 'react';
import { LocalCache } from '../localCache/localCache';

interface SelectIndustryScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export const SelectIndustryScreen: React.FC<SelectIndustryScreenProps> = ({ onNext, onBack }) => {
  const [industry, setIndustry] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await LocalCache.saveUserProfile({ industry });
    onNext();
  };

  return (
    <div className="screenContainer">
      <h2>Select Industry</h2>
      <form onSubmit={handleSubmit}>
        <div className="inputGroup">
          <label htmlFor="industry">Industry</label>
          <select
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            required
          >
            <option value="">Select...</option>
            <option value="technology">Technology</option>
            <option value="healthcare">Healthcare</option>
            <option value="finance">Finance</option>
            <option value="education">Education</option>
            <option value="other">Other</option>
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