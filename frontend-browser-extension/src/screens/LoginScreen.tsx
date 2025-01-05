import React, { useState } from 'react';
import { LocalCache } from '../localCache/localCache';

interface LoginScreenProps {
  onNext: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNext }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await LocalCache.saveUserProfile({ email });
    onNext();
  };

  return (
    <div className="screenContainer">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="inputGroup">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="buttonRow">
          <button type="submit" className="nextButton">Next</button>
        </div>
      </form>
    </div>
  );
}; 