const { 
  startTimer,
  pauseTimer,
  resetTimer,
  updateTimer,
  switchSession,
  setTimerDisplay,
  updateTimerDisplay
} = require('../../src/script');

// Mock DOM elements
document.body.innerHTML = `
  <div id="timer"></div>
  <input id="studyTime" value="25">
  <input id="breakTime" value="5">
  <input id="reminderInterval" value="5">
  <input id="reminderVolume" value="1">
`;

// Mock chrome API
global.chrome = {
  runtime: {
    sendMessage: jest.fn()
  },
  storage: {
    sync: {
      get: jest.fn((keys, callback) => callback({ reminderVolume: 1 })),
      set: jest.fn()
    }
  }
};

describe('Timer Script', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('startTimer starts the timer correctly', () => {
    startTimer();
    expect(isPaused).toBe(false);
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(expect.objectContaining({
      command: 'startReminder'
    }));
  });

  test('pauseTimer pauses the timer correctly', () => {
    startTimer();
    pauseTimer();
    expect(isPaused).toBe(true);
    expect(clearInterval).toHaveBeenCalled();
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ command: 'stopReminder' });
  });

  test('resetTimer resets the timer correctly', () => {
    startTimer();
    resetTimer();
    expect(isPaused).toBe(true);
    expect(isStudySession).toBe(true);
    expect(document.getElementById('timer').textContent).toBe('25:00');
  });

  test('updateTimer updates the timer correctly', () => {
    timeLeft = 10;
    updateTimer();
    expect(timeLeft).toBe(9);
  });

  test('switchSession switches between study and break sessions', () => {
    isStudySession = true;
    switchSession();
    expect(isStudySession).toBe(false);
    switchSession();
    expect(isStudySession).toBe(true);
  });

  test('setTimerDisplay sets the correct time for study and break sessions', () => {
    isStudySession = true;
    setTimerDisplay();
    expect(timeLeft).toBe(25 * 60);
    isStudySession = false;
    setTimerDisplay();
    expect(timeLeft).toBe(5 * 60);
  });

  test('updateTimerDisplay updates the display correctly', () => {
    timeLeft = 65;
    updateTimerDisplay();
    expect(document.getElementById('timer').textContent).toBe('01:05');
  });
});