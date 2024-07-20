// src/timer.js
let timer;
let timeLeft;

function startTimer(duration) {
  timeLeft = duration;
  timer = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(timer);
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timer);
}

function resetTimer(duration) {
  clearInterval(timer);
  timeLeft = duration;
}

function getTimeLeft() {
  return timeLeft;
}

module.exports = { startTimer, pauseTimer, resetTimer, getTimeLeft };