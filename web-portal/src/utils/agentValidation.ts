/**
 * agentValidation.ts
 * 
 * Provides validation logic for Agent entities before dispatching them
 * to the store or sending to the AI microservice.
 */
import { Agent } from '../store/agents/agentsSlice';

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates the Agent data. Checks for missing fields, optional JSON correctness, etc.
 */
export const validateAgent = (agentData: Partial<Agent>): ValidationResult => {
  const errors: string[] = [];

  if (!agentData.name) {
    errors.push('Agent name is required.');
  }

  if (!agentData.modelProvider) {
    errors.push('Model provider is required.');
  }

  if (!agentData.clients || agentData.clients.length === 0) {
    errors.push('Select at least one supported client.');
  }

  // Validate JSON fields
  if (agentData.messageExamples && typeof agentData.messageExamples === 'string') {
    try {
      JSON.parse(agentData.messageExamples);
    } catch {
      errors.push('Message Examples must be valid JSON.');
    }
  }

  if (agentData.settings && typeof agentData.settings === 'string') {
    try {
      JSON.parse(agentData.settings);
    } catch {
      errors.push('Settings must be valid JSON.');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}; 