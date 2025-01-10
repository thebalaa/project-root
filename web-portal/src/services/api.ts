const getBaseUrl = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  console.log('Current hostname:', hostname);
  console.log('Current protocol:', protocol);

  // Always use the same origin as the frontend
  return '';
};

export const API_BASE_URL = getBaseUrl();
console.log('Using API Base URL:', API_BASE_URL);

export const fetchWithCredentials = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log('Fetching from:', url);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('API call failed:', {
        status: response.status,
        statusText: response.statusText,
        url: url
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}; 