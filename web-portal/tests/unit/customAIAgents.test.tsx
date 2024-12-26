// tests/unit/customAIAgents.test.tsx

/**
 * customAIAgents.test.tsx
 * 
 * Unit tests for Custom AI Agents components.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import CustomAIAgentsDashboard from '../../src/components/CustomAIAgents/CustomAIAgentsDashboard';
import AgentList from '../../src/components/CustomAIAgents/AgentList';
import AgentConfigForm from '../../src/components/CustomAIAgents/AgentConfigForm';
import { Agent } from '../../src/store/agents/agentsSlice';

const mockStore = configureStore([]);
const initialState = {
  agents: {
    agents: [
      {
        id: '1',
        name: 'TechAI',
        modelProvider: 'anthropic',
        clients: ['discord', 'direct'],
        bio: ['AI researcher and educator focused on practical applications'],
        lore: ['Pioneer in open-source AI development'],
        messageExamples: [],
        postExamples: ['Understanding AI does not require a PhD'],
        topics: ['AI', 'machine learning'],
        adjectives: ['knowledgeable', 'approachable'],
        style: {
          all: ['explain complex topics simply'],
          chat: ['use relevant examples'],
          post: ['focus on practical insights'],
        },
        settings: {
          model: 'claude-3-opus-20240229',
          voice: { model: 'en-US-neural' },
        },
        runtimeStatus: 'running',
        runtimeError: null,
      },
    ],
    status: 'succeeded',
    error: null,
  },
};

describe('CustomAIAgentsDashboard', () => {
  let store: MockStoreEnhanced<unknown, {}>;

  beforeEach(() => {
    store = mockStore(initialState);
    store.dispatch = jest.fn();
  });

  test('renders agent list', () => {
    render(
      <Provider store={store}>
        <CustomAIAgentsDashboard />
      </Provider>
    );

    expect(screen.getByText('Custom AI Agents')).toBeInTheDocument();
    expect(screen.getByText('Existing AI Agents')).toBeInTheDocument();
    expect(screen.getByText('TechAI')).toBeInTheDocument();
  });

  test('renders AgentConfigForm and submits data', () => {
    store.dispatch = jest.fn();

    render(
      <Provider store={store}>
        <CustomAIAgentsDashboard />
      </Provider>
    );

    fireEvent.change(screen.getByLabelText(/Agent Name/i), {
      target: { value: 'NewAgent' },
    });
    fireEvent.change(screen.getByLabelText(/Model Provider/i), {
      target: { value: 'openai' },
    });
    fireEvent.change(screen.getByLabelText(/Supported Clients/i), {
      target: { options: [{ selected: true, value: 'twitter' }] },
    });

    fireEvent.click(screen.getByText(/Create Agent/i));

    expect(store.dispatch).toHaveBeenCalledTimes(1);
  });
});

describe('AgentList', () => {
  const agents: Agent[] = initialState.agents.agents;

  test('renders list of agents', () => {
    render(<AgentList agents={agents} />);

    expect(screen.getByText('TechAI')).toBeInTheDocument();
    expect(screen.getByText('Model Provider: anthropic')).toBeInTheDocument();
    expect(screen.getByText('Clients: discord, direct')).toBeInTheDocument();
  });

  test('handles delete agent', () => {
    window.confirm = jest.fn(() => true);
    const dispatch = jest.fn();
    const mockStoreWithDispatch = mockStore(initialState);
    mockStoreWithDispatch.dispatch = dispatch;

    render(
      <Provider store={mockStoreWithDispatch}>
        <AgentList agents={agents} />
      </Provider>
    );

    fireEvent.click(screen.getByText('Delete'));
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this agent?');
    expect(dispatch).toHaveBeenCalledWith(deleteAgent('1'));
  });
});

describe('AgentConfigForm', () => {
  const store = mockStore(initialState);
  store.dispatch = jest.fn();

  test('renders form fields', () => {
    render(
      <Provider store={store}>
        <AgentConfigForm />
      </Provider>
    );

    expect(screen.getByLabelText(/Agent Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Model Provider/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Supported Clients/i)).toBeInTheDocument();
  });

  test('submits form with valid data', () => {
    render(
      <Provider store={store}>
        <AgentConfigForm />
      </Provider>
    );

    fireEvent.change(screen.getByLabelText(/Agent Name/i), {
      target: { value: 'TestAgent' },
    });
    fireEvent.change(screen.getByLabelText(/Model Provider/i), {
      target: { value: 'llama_local' },
    });
    fireEvent.change(screen.getByLabelText(/Supported Clients/i), {
      target: { options: [{ selected: true, value: 'telegram' }] },
    });

    fireEvent.click(screen.getByText(/Create Agent/i));

    expect(store.dispatch).toHaveBeenCalledTimes(1);
  });

  test('alerts on missing required fields', () => {
    window.alert = jest.fn();

    render(
      <Provider store={store}>
        <AgentConfigForm />
      </Provider>
    );

    fireEvent.click(screen.getByText(/Create Agent/i));

    expect(window.alert).toHaveBeenCalledWith('Please fill in all required fields.');
    expect(store.dispatch).toHaveBeenCalledTimes(0);
  });

  test('alerts on invalid JSON for message examples', () => {
    window.alert = jest.fn();
    render(
      <Provider store={store}>
        <AgentConfigForm />
      </Provider>
    );

    fireEvent.change(screen.getByLabelText(/Agent Name/i), {
      target: { value: 'InvalidJSONAgent' },
    });
    fireEvent.change(screen.getByLabelText(/Model Provider/i), {
      target: { value: 'openai' },
    });
    fireEvent.change(screen.getByLabelText(/Supported Clients/i), {
      target: { options: [{ selected: true, value: 'discord' }] },
    });
    fireEvent.change(screen.getByLabelText(/Message Examples/i), {
      target: { value: 'invalid json' },
    });

    fireEvent.click(screen.getByText(/Create Agent/i));

    expect(window.alert).toHaveBeenCalledWith('Invalid JSON format for Message Examples.');
    expect(store.dispatch).toHaveBeenCalledTimes(0);
  });

  test('alerts on invalid JSON for settings', () => {
    window.alert = jest.fn();
    render(
      <Provider store={store}>
        <AgentConfigForm />
      </Provider>
    );

    fireEvent.change(screen.getByLabelText(/Agent Name/i), {
      target: { value: 'InvalidSettingsAgent' },
    });
    fireEvent.change(screen.getByLabelText(/Model Provider/i), {
      target: { value: 'openai' },
    });
    fireEvent.change(screen.getByLabelText(/Supported Clients/i), {
      target: { options: [{ selected: true, value: 'discord' }] },
    });
    fireEvent.change(screen.getByLabelText(/Settings/i), {
      target: { value: 'invalid json' },
    });

    fireEvent.click(screen.getByText(/Create Agent/i));

    expect(window.alert).toHaveBeenCalledWith('Invalid JSON format for Settings.');
    expect(store.dispatch).toHaveBeenCalledTimes(0);
  });
});
