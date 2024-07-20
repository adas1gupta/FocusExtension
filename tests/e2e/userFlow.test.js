// tests/e2e/userFlow.test.js

// You might need to use a testing library that can interact with browser APIs
// For this example, we'll assume direct access to extension functions
import { chrome } from 'jest-chrome';
global.chrome = chrome;
const { startTimer, pauseTimer, resetTimer, sendAnalytics } = require('../../src/background');

// Mock chrome storage and other browser APIs
const mockChrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  },
  runtime: {
    sendMessage: jest.fn()
  }
};

global.chrome = mockChrome;

describe('User Flow', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test('Complete study session flow', async () => {
    // Simulate starting a study session
    startTimer();
    expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({ command: 'startReminder' });

    // Simulate time passing (e.g., 25 minutes)
    jest.advanceTimersByTime(25 * 60 * 1000);

    // Simulate ending the session
    const analyticsData = {
      sessionType: 'study',
      duration: 25 * 60,
      reminderInterval: 5,
      reminderVolume: 0.5,
      dayOfWeek: new Date().getDay(),
      hourOfDay: new Date().getHours(),
      timeOfDayStarted: new Date().toISOString(),
      pauseFrequency: 0,
      reminderSoundCount: 5
    };

    await sendAnalytics(analyticsData);

    // Check if analytics were sent
    expect(mockChrome.storage.local.get).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/analytics', expect.any(Object));
  });

  test('Pause and resume session', () => {
    startTimer();
    pauseTimer();
    expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({ command: 'stopReminder' });

    startTimer(); // Resume
    expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({ command: 'startReminder' });
  });

  test('Reset timer', () => {
    // Set initial study time
    const initialStudyTime = 25;
    document.getElementById('studyTime').value = initialStudyTime;
  
    startTimer();
    
    // Advance timer by 5 minutes
    jest.advanceTimersByTime(5 * 60 * 1000);
    
    resetTimer();
    
    expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({ command: 'stopReminder' });
    
    // Check if the timer display shows the initial study time
    expect(document.getElementById('timerDisplay').textContent).toBe('25:00');
  });
});