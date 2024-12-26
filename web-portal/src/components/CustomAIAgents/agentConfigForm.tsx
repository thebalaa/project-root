// src/components/CustomAIAgents/AgentConfigForm.tsx

import React from 'react';
import './CustomAIAgents.css';
import { useAgentForm } from '../../../hooks/useAgentForm'; // Adjust path if needed

const AgentConfigForm: React.FC = () => {
  const { formData, handleChange, handleSubmit } = useAgentForm();

  return (
    <div className="agent-config-form">
      <h3>Create New AI Agent</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Agent Name*</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter agent name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="modelProvider">Model Provider*</label>
          <select
            id="modelProvider"
            name="modelProvider"
            value={formData.modelProvider}
            onChange={handleChange}
            required
          >
            <option value="">Select Provider</option>
            <option value="anthropic">Anthropic</option>
            <option value="openai">OpenAI</option>
            <option value="llama_local">Llama Local</option>
            {/* Add more providers as needed */}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="clients">Supported Clients*</label>
          <select
            id="clients"
            name="clients"
            multiple
            value={formData.clients}
            onChange={handleChange}
            required
          >
            <option value="discord">Discord</option>
            <option value="twitter">Twitter/X</option>
            <option value="telegram">Telegram</option>
            <option value="farcaster">Farcaster</option>
            <option value="direct">Direct (REST API)</option>
            {/* Add more if needed */}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Enter bio lines separated by new lines"
          />
        </div>

        <div className="form-group">
          <label htmlFor="lore">Lore</label>
          <textarea
            id="lore"
            name="lore"
            value={formData.lore}
            onChange={handleChange}
            placeholder="Enter lore lines separated by new lines"
          />
        </div>

        <div className="form-group">
          <label htmlFor="messageExamples">Message Examples (JSON)</label>
          <textarea
            id="messageExamples"
            name="messageExamples"
            value={formData.messageExamples}
            onChange={handleChange}
            placeholder='Enter message examples as JSON, e.g., [["user message", "agent response"]]'
          />
        </div>

        <div className="form-group">
          <label htmlFor="postExamples">Post Examples</label>
          <textarea
            id="postExamples"
            name="postExamples"
            value={formData.postExamples}
            onChange={handleChange}
            placeholder="Enter post examples separated by new lines"
          />
        </div>

        <div className="form-group">
          <label htmlFor="topics">Topics (comma-separated)</label>
          <input
            type="text"
            id="topics"
            name="topics"
            value={formData.topics}
            onChange={handleChange}
            placeholder="e.g., AI, machine learning, technology education"
          />
        </div>

        <div className="form-group">
          <label htmlFor="adjectives">Adjectives (comma-separated)</label>
          <input
            type="text"
            id="adjectives"
            name="adjectives"
            value={formData.adjectives}
            onChange={handleChange}
            placeholder="e.g., knowledgeable, approachable, practical"
          />
        </div>

        <div className="form-group">
          <label htmlFor="styleAll">Style - All</label>
          <textarea
            id="styleAll"
            name="styleAll"
            value={formData.styleAll}
            onChange={handleChange}
            placeholder="Enter style instructions for all interactions separated by new lines"
          />
        </div>

        <div className="form-group">
          <label htmlFor="styleChat">Style - Chat</label>
          <textarea
            id="styleChat"
            name="styleChat"
            value={formData.styleChat}
            onChange={handleChange}
            placeholder="Enter style instructions for chat interactions separated by new lines"
          />
        </div>

        <div className="form-group">
          <label htmlFor="stylePost">Style - Post</label>
          <textarea
            id="stylePost"
            name="stylePost"
            value={formData.stylePost}
            onChange={handleChange}
            placeholder="Enter style instructions for post interactions separated by new lines"
          />
        </div>

        <div className="form-group">
          <label htmlFor="settings">Settings (JSON)</label>
          <textarea
            id="settings"
            name="settings"
            value={formData.settings}
            onChange={handleChange}
            placeholder='Enter settings as JSON, e.g., {"model": "claude-3-opus-20240229", "voice": {"model": "en-US-neural"}}'
          />
        </div>

        <button type="submit" className="submit-button">
          Create Agent
        </button>
      </form>
    </div>
  );
};

export default AgentConfigForm;
