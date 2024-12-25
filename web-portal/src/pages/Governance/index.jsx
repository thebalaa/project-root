import React from 'react';
import './Governance.css';
import GovernanceDashboard from '../../components/Governance/governanceDashboard.jsx';

const Governance = () => {
  return (
    <div className="governance-page">
      <h2>Network Governance</h2>
      <GovernanceDashboard />
    </div>
  );
};

export default Governance;
