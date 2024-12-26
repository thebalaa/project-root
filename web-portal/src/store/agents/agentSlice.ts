// src/store/agents/agentsSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import agentService from '../../services/agentService';
import { initializeElizaRuntime, stopElizaRuntime } from '../../services/elizaService';

export interface EncryptedKey {
  publicKey: string;
  encryptedKey: string;
}

export interface EncryptedAgentData {
  encryptedData: string;
  iv: string;
  authTag: string;
  encryptedKeys: EncryptedKey[];
}

export interface Agent {
  id: string;
  name: string;
  modelProvider: string;
  clients: string[];
  bio: string[];
  lore: string[];
  messageExamples: any[]; // Define more specific types as needed
  postExamples: string[];
  topics: string[];
  adjectives: string[];
  style: {
    all: string[];
    chat: string[];
    post: string[];
  };
  settings: {
    model: string;
    voice: {
      model: string;
      url?: string;
    };
    secrets?: Record<string, string>;
    embeddingModel?: string;
  };
  runtimeStatus?: string;
  runtimeError?: string | null;
}

interface AgentsState {
  agents: Agent[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AgentsState = {
  agents: [],
  status: 'idle',
  error: null,
};

/**
 * Async thunk to fetch agents.
 */
export const fetchAgents = createAsyncThunk('agents/fetchAgents', async () => {
  const response = await agentService.fetchAgents();
  return response;
});

/**
 * Async thunk to add a new agent.
 */
export const addAgent = createAsyncThunk('agents/addAgent', async (agentData: Agent) => {
  const response = await agentService.createAgent(agentData);
  // Initialize Eliza runtime after agent creation
  await initializeElizaRuntime(response.id, agentData);
  return response;
});

/**
 * Async thunk to delete an agent.
 */
export const deleteAgent = createAsyncThunk('agents/deleteAgent', async (agentId: string) => {
  await agentService.deleteAgent(agentId);
  // Stop Eliza runtime before deletion
  await stopElizaRuntime(agentId);
  return agentId;
});

const agentsSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    /**
     * Update the runtime status of an agent.
     * @param {PayloadAction<{ agentId: string; status: string; error?: string | null }>} action 
     */
    updateAgentRuntimeStatus(state, action: PayloadAction<{ agentId: string; status: string; error?: string | null }>) {
      const { agentId, status, error = null } = action.payload;
      const existingAgent = state.agents.find((agent) => agent.id === agentId);
      if (existingAgent) {
        existingAgent.runtimeStatus = status;
        if (error) {
          existingAgent.runtimeError = error;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAgents
      .addCase(fetchAgents.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAgents.fulfilled, (state, action: PayloadAction<Agent[]>) => {
        state.status = 'succeeded';
        state.agents = action.payload;
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch agents';
      })
      // addAgent
      .addCase(addAgent.fulfilled, (state, action: PayloadAction<Agent>) => {
        state.agents.push({ ...action.payload, runtimeStatus: 'running', runtimeError: null });
      })
      .addCase(addAgent.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to add agent';
      })
      // deleteAgent
      .addCase(deleteAgent.fulfilled, (state, action: PayloadAction<string>) => {
        state.agents = state.agents.filter((agent) => agent.id !== action.payload);
      })
      .addCase(deleteAgent.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete agent';
      });
  },
});

// Actions
export const { updateAgentRuntimeStatus } = agentsSlice.actions;

// Selectors
export const selectAllAgents = (state: { agents: AgentsState }) => state.agents.agents;
export const selectAgentById = (state: { agents: AgentsState }, agentId: string) =>
  state.agents.agents.find((agent) => agent.id === agentId);

export default agentsSlice.reducer;
