 // src/components/CustomAIAgents/CustomAIAgentsDashboard.tsx

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAgents, selectAllAgents, Agent } from '../../store/agents/agentsSlice';
import AgentList from './AgentList';
import AgentConfigForm from './AgentConfigForm';
import './CustomAIAgents.css';
import { RootState } from '../../store';

const CustomAIAgentsDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const agents: Agent[] = useSelector(selectAllAgents);
  const agentStatus = useSelector((state: RootState) => state.agents.status);
  const error = useSelector((state: RootState) => state.agents.error);

  useEffect(() => {
    if (agentStatus === 'idle') {
      dispatch(fetchAgents());
    }
  }, [agentStatus, dispatch]);

  let content;

  if (agentStatus === 'loading') {
    content = <div>Loading agents...</div>;
  } else if (agentStatus === 'succeeded') {
    content = <AgentList agents={agents} />;
  } else if (agentStatus === 'failed') {
    content = <div>{error}</div>;
  }

  return (
    <div className="custom-ai-agents-dashboard">
      <h2>Custom AI Agents</h2>
      {content}
      <AgentConfigForm />
    </div>
  );
};

export default CustomAIAgentsDashboard;
