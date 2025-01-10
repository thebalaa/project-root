import { API_BASE_URL, fetchWithCredentials } from './api';

export const sendMessageToDiscord = async (message: string) => {
  try {
    console.log('Sending message to Discord via:', `${API_BASE_URL}/api/discord/messages`);
    
    const response = await fetchWithCredentials('/api/discord/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    
    console.log('Discord response:', response);
    return response;
  } catch (error: any) {
    console.error('Discord service error details:', {
      message: error.message,
      baseUrl: API_BASE_URL,
      stack: error.stack
    });
    throw error;
  }
};