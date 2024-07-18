let reminderInterval = 5; // Default reminder interval in seconds

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ reminderInterval, reminderVolume: 1 });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === 'startReminder') {
    startReminder(message.reminderInterval);
  } else if (message.command === 'stopReminder') {
    stopReminder();
  }
});

function startReminder(interval) {
  stopReminder(); // Clear any existing alarms
  chrome.alarms.create('reminderAlarm', { periodInMinutes: interval / 60 });
}

function stopReminder() {
  chrome.alarms.clear('reminderAlarm');
}