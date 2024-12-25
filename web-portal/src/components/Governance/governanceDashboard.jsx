import React from 'react';
import './GovernanceDashboard.css';

const GovernanceDashboard = () => {
  return (
    <div className="governance-dashboard">
      <div className="governance-header">
        <h3>Active Proposals</h3>
        <p>Join the community decision-making process.</p>
      </div>

      <div className="proposals-list">
        <div className="proposal-card">
          <h4>Proposal #23: Upgrade Node Protocol</h4>
          <p>Voting ends in 3 days. Current status: 65% support</p>
          <button className="vote-btn">Vote</button>
        </div>
        <div className="proposal-card">
          <h4>Proposal #24: Add New Token Rewards</h4>
          <p>Voting ends in 7 days. Current status: 40% support</p>
          <button className="vote-btn">Vote</button>
        </div>
      </div>
    </div>
  );
};

export default GovernanceDashboard;
