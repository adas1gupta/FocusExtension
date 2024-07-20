// tests/unit/timer.test.js
const { startTimer, pauseTimer, resetTimer, getTimeLeft } = require('../../src/timer');

jest.useFakeTimers();

describe('Timer', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  test('startTimer decrements time', () => {
    startTimer(60);
    expect(getTimeLeft()).toBe(60);
    jest.advanceTimersByTime(1000);
    expect(getTimeLeft()).toBe(59);
  });

  test('pauseTimer stops the timer', () => {
    startTimer(60);
    jest.advanceTimersByTime(5000);
    pauseTimer();
    const timeLeftAfterPause = getTimeLeft();
    jest.advanceTimersByTime(5000);
    expect(getTimeLeft()).toBe(timeLeftAfterPause);
  });

  test('resetTimer sets time back to initial duration', () => {
    startTimer(60);
    jest.advanceTimersByTime(10000);
    resetTimer(60);
    expect(getTimeLeft()).toBe(60);
  });
});