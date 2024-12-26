// src/pages/CustomAIAgents/index.tsx

import React from 'react';
import CustomAIAgentsDashboard from '../../components/CustomAIAgents/CustomAIAgentsDashboard';
import '../../components/CustomAIAgents/CustomAIAgents.css';

const CustomAIAgentsPage: React.FC = () => {
  return (
    <div className="custom-ai-agents-page">
      <CustomAIAgentsDashboard />
    </div>
  );
};

export default CustomAIAgentsPage;
