// src/types/elizaTypes.ts

export interface AgentConfig {
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
  }
  