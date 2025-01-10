export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  discordMessageId?: string;
}

export interface ChatResponse {
  response: string;
  error?: string;
  discordMessageId?: string;
}

export interface DiscordConfig {
  channelId: string;
  botToken: string;
  apiEndpoint: string;
} 