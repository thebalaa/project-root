// src/services/elizaService.ts

/**
 * elizaService.ts
 * 
 * Manages the lifecycle of Eliza runtimes for AI agents, ensuring secure and efficient operations.
 */

import Eliza from 'eliza-framework'; // Replace with actual import path
import store from '../store';
import { updateAgentRuntimeStatus } from '../store/agents/agentsSlice';
import { Agent } from '../store/agents/agentsSlice';
import { AgentConfig } from '../types/elizaTypes'; // Define Eliza-specific types

/**
 * Initializes the Eliza runtime for a specific agent.
 * @param {string} agentId - The ID of the agent.
 * @param {Agent} agentData - Configuration data for the agent.
 */
export const initializeElizaRuntime = async (agentId: string, agentData: Agent): Promise<void> => {
  try {
    const runtime = new Eliza.Runtime({
      agentId,
      serverUrl: process.env.REACT_APP_ELIZA_SERVER_URL || 'http://localhost:7000',
      token: store.getState().auth.token || '',
      character: {
        name: agentData.name,
        modelProvider: agentData.modelProvider,
        clients: agentData.clients,
        bio: agentData.bio,
        lore: agentData.lore,
        messageExamples: agentData.messageExamples,
        postExamples: agentData.postExamples,
        topics: agentData.topics,
        adjectives: agentData.adjectives,
        style: agentData.style,
        settings: agentData.settings,
      } as AgentConfig, // Cast to Eliza's AgentConfig interface
      // Additional configurations as needed
    });

    // Start the runtime
    await runtime.start();

    // Update agent status in Redux store
    store.dispatch(updateAgentRuntimeStatus({ agentId, status: 'running', error: null }));
  } catch (error: any) {
    console.error(`Failed to initialize Eliza runtime for agent ${agentId}:`, error);
    store.dispatch(updateAgentRuntimeStatus({ agentId, status: 'error', error: error.message }));
  }
};

/**
 * Stops the Eliza runtime for a specific agent.
 * @param {string} agentId - The ID of the agent.
 */
export const stopElizaRuntime = async (agentId: string): Promise<void> => {
  try {
    const runtime = Eliza.Runtime.getRuntime(agentId);
    if (runtime) {
      await runtime.stop();
      store.dispatch(updateAgentRuntimeStatus({ agentId, status: 'stopped', error: null }));
    }
  } catch (error: any) {
    console.error(`Failed to stop Eliza runtime for agent ${agentId}:`, error);
    store.dispatch(updateAgentRuntimeStatus({ agentId, status: 'error', error: error.message }));
  }
};

// Additional functions to manage Eliza runtimes can be added here
