import React, { useState } from 'react';
import { storeLoginDetails } from '../localCache/localCache';

interface LoginScreenProps {
  onNext: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onNext }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Example: Interact with localCache or a service
    storeLoginDetails(username, password);
    onNext();
  };

  return (
    <div className="screenContainer">
      <h2>Login</h2>
      <div className="inputGroup">
        <label>Username</label>
        <input 
          value={username}
          onChange={(e) => setUsername(e.target.value)} 
          type="text" 
        />
      </div>
      <div className="inputGroup">
        <label>Password</label>
        <input 
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
          type="password" 
        />
      </div>
      <button className="nextButton" onClick={handleLogin}>Login</button>
    </div>
  );
};

export default LoginScreen; 