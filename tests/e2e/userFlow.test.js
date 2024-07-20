/**
 * @jest-environment jsdom
 */

const { sendAnalytics } = require('../../src/background');

// Mock chrome object
global.chrome = {
  runtime: {
    sendMessage: jest.fn((message) => {
      if (message.command === 'sendAnalytics') {
        sendAnalytics(message.data);
      }
    }),
  },
  storage: {
    sync: {
      get: jest.fn((keys, callback) => callback({ reminderVolume: 1 })),
      set: jest.fn(),
    },
  },
};

// Mock the script functions
const mockStartTimer = jest.fn(() => {
  chrome.runtime.sendMessage({ command: 'startReminder', reminderInterval: 5 });
});

const mockPauseTimer = jest.fn(() => {
  chrome.runtime.sendMessage({ command: 'stopReminder' });
});

const mockResetTimer = jest.fn(() => {
  chrome.runtime.sendMessage({ command: 'stopReminder' });
});

jest.mock('../../src/script', () => ({
  startTimer: mockStartTimer,
  pauseTimer: mockPauseTimer,
  resetTimer: mockResetTimer,
}));

jest.mock('../../src/background', () => ({
  sendAnalytics: jest.fn(),
  setupOnStartupListener: jest.fn(),
}));

describe('User Flow', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    document.body.innerHTML = `
      <div id="timerDisplay"></div>
      <input id="studyTime" value="25">
      <input id="breakTime" value="5">
      <input id="reminderInterval" value="5">
      <input id="reminderVolume" value="1">
    `;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('Complete study session flow', () => {
    mockStartTimer();
    expect(mockStartTimer).toHaveBeenCalled();
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(expect.objectContaining({ 
      command: 'startReminder'
    }));

    jest.advanceTimersByTime(25 * 60 * 1000);

    // Simulate the end of a session
    chrome.runtime.sendMessage({ command: 'sendAnalytics', data: {} });
    expect(sendAnalytics).toHaveBeenCalled();
  });

  test('Pause and resume session', () => {
    mockStartTimer();
    expect(mockStartTimer).toHaveBeenCalled();
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(expect.objectContaining({ 
      command: 'startReminder'
    }));

    mockPauseTimer();
    expect(mockPauseTimer).toHaveBeenCalled();
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ command: 'stopReminder' });

    mockStartTimer(); // Resume
    expect(mockStartTimer).toHaveBeenCalledTimes(2);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(expect.objectContaining({ 
      command: 'startReminder'
    }));
  });

  test('Reset timer', () => {
    document.getElementById('timerDisplay').textContent = '12:34'; // Set some initial time

    mockResetTimer();
    expect(mockResetTimer).toHaveBeenCalled();
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ command: 'stopReminder' });
  });
});