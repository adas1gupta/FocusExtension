let timer;
let timeLeft;
let isStudySession = true;
let isPaused = true;
let reminderTimer;

const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const studyTimeInput = document.getElementById('studyTime');
const breakTimeInput = document.getElementById('breakTime');
const reminderIntervalInput = document.getElementById('reminderInterval');
const reminderVolumeInput = document.getElementById('reminderVolume');

function startTimer() {
  if (isPaused) {
    isPaused = false;
    setTimerDisplay();
    timer = setInterval(updateTimer, 1000);
    const reminderInterval = parseInt(reminderIntervalInput.value);
    chrome.runtime.sendMessage({ 
      command: 'startReminder', 
      reminderInterval: reminderInterval
    });
    if (isStudySession) {
      startReminderSound();
    }
  }
}

function pauseTimer() {
  isPaused = true;
  clearInterval(timer);
  stopReminderSound();
  chrome.runtime.sendMessage({ command: 'stopReminder' });
}

function resetTimer() {
  pauseTimer();
  isStudySession = true;
  setTimerDisplay();
  updateTimerDisplay();
}

function updateTimer() {
  if (timeLeft > 0) {
    timeLeft--;
    updateTimerDisplay();
    if (isStudySession && timeLeft % (parseInt(reminderIntervalInput.value) * 60) === 0 && timeLeft !== 0) {
      playReminderSound();
    }
    if (timeLeft === 0) {
      stopReminderSound();
      setTimeout(switchSession, 1000);
    }
  }
}

function switchSession() {
  isStudySession = !isStudySession;
  setTimerDisplay();
  if (!isStudySession) {
    playSessionEndSound();
  } else {
    startReminderSound();
  }
}
function setTimerDisplay() {
  const studyTime = parseInt(studyTimeInput.value) || 25; // Default to 25 if invalid
  const breakTime = parseInt(breakTimeInput.value) || 5; // Default to 5 if invalid
  timeLeft = (isStudySession ? studyTime : breakTime) * 60;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function playSessionEndSound() {
  const audio = new Audio('session_end_sound.mp3');
  audio.play();
}

function startReminderSound() {
  if (isStudySession) {
    const reminderInterval = parseInt(reminderIntervalInput.value) * 1000;
    reminderTimer = setInterval(playReminderSound, reminderInterval);
  }
}

function stopReminderSound() {
  clearInterval(reminderTimer);
}

function playReminderSound() {
  chrome.storage.sync.get('reminderVolume', ({ reminderVolume }) => {
    const audio = new Audio('reminder_sound.mp3');
    audio.volume = reminderVolume || 1;
    audio.play();
  });
}

// Event listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

studyTimeInput.addEventListener('change', setTimerDisplay);
breakTimeInput.addEventListener('change', setTimerDisplay);

reminderIntervalInput.addEventListener('change', (e) => {
  chrome.storage.sync.set({ reminderInterval: e.target.value });
});

reminderVolumeInput.addEventListener('change', (e) => {
  chrome.storage.sync.set({ reminderVolume: e.target.value });
});

// Load saved settings
chrome.storage.sync.get(['reminderInterval', 'reminderVolume'], (result) => {
  reminderIntervalInput.value = result.reminderInterval || 5;
  reminderVolumeInput.value = result.reminderVolume || 1;
});

// Initialize the timer display
setTimerDisplay();