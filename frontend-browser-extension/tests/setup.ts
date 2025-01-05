import 'jest-fetch-mock';

// Mock chrome API for all tests
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  },
  runtime: {
    sendMessage: jest.fn()
  },
  tabs: {
    onUpdated: {
      addListener: jest.fn()
    }
  }
} as any; 