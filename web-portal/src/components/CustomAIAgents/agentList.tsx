// src/components/CustomAIAgents/AgentList.tsx

import React from 'react';
import { useDispatch } from 'react-redux';
import { deleteAgent, Agent } from '../../store/agents/agentsSlice';
import './CustomAIAgents.css';

interface AgentListProps {
  agents: Agent[];
}

const AgentList: React.FC<AgentListProps> = ({ agents }) => {
  const dispatch = useDispatch();

  const handleDelete = (agentId: string) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      dispatch(deleteAgent(agentId));
    }
  };

  return (
    <div className="agent-list">
      <h3>Existing AI Agents</h3>
      {agents.length === 0 ? (
        <p>No AI agents found. Please create one.</p>
      ) : (
        <ul>
          {agents.map((agent) => (
            <li key={agent.id} className="agent-item">
              <div className="agent-info">
                <h4>{agent.name}</h4>
                <p>Model Provider: {agent.modelProvider}</p>
                <p>Clients: {agent.clients.join(', ')}</p>
              </div>
              <div className="agent-actions">
                <button onClick={() => handleDelete(agent.id)} className="delete-button">
                  Delete
                </button>
                {/* Additional actions like Edit can be added here */}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AgentList;
