const { startTimer, pauseTimer, resetTimer } = require('../../src/timer');

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllTimers();
});

test('Timer starts correctly', () => {
  startTimer();
  expect(setInterval).toHaveBeenCalledTimes(1);
  expect(setInterval).toHaveBeenLastCalledWith(expect.any(Function), 1000);
});

test('Timer pauses correctly', () => {
  startTimer();
  pauseTimer();
  expect(clearInterval).toHaveBeenCalledTimes(1);
});

test('Timer resets correctly', () => {
  startTimer();
  resetTimer();
  expect(clearInterval).toHaveBeenCalledTimes(1);
  expect(setInterval).toHaveBeenCalledTimes(1);
});