// Add proper TypeScript interfaces
interface ClientConfig {
  type: string;
  enabled: boolean;
  options?: Record<string, unknown>;
}

interface AgentConfig {
  clients: ClientConfig[];
  // ... other config options
} 