export interface CompanionStatus {
  isHealthy: boolean;
  version?: string;
}

export interface CompanionMessage {
  type: 'CHECK_COMPANION' | 'UPDATE_SETTINGS';
  payload?: any;
} 