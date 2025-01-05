import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import Popup from '../src/popup';

// Mock chrome API
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  },
  runtime: {
    sendMessage: jest.fn()
  }
} as any;

describe('Popup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({ forwardUrlsEnabled: false });
    });
    chrome.runtime.sendMessage.mockImplementation((msg, callback) => {
      callback({ isHealthy: true });
    });
  });

  it('should render correctly', () => {
    const { getByText } = render(<Popup />);
    expect(getByText('Web Data Collector')).toBeInTheDocument();
  });

  it('should toggle forwarding state', async () => {
    const { getByRole } = render(<Popup />);
    const checkbox = getByRole('checkbox');

    await act(async () => {
      fireEvent.click(checkbox);
    });

    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      forwardUrlsEnabled: true
    });
  });

  it('should show offline status when companion is down', async () => {
    chrome.runtime.sendMessage.mockImplementation((msg, callback) => {
      callback({ isHealthy: false });
    });

    const { getByText } = render(<Popup />);
    expect(getByText('OFFLINE')).toBeInTheDocument();
  });
}); 