import React, { useState } from 'react';
import { LocalCache } from '../localCache/localCache';

interface SelectRoleScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export const SelectRoleScreen: React.FC<SelectRoleScreenProps> = ({ onNext, onBack }) => {
  const [role, setRole] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await LocalCache.saveUserProfile({ role });
    onNext();
  };

  return (
    <div className="screenContainer">
      <h2>Your Role</h2>
      <form onSubmit={handleSubmit}>
        <div className="inputGroup">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="">Select...</option>
            <option value="developer">Developer</option>
            <option value="manager">Manager</option>
            <option value="executive">Executive</option>
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