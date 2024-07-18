let reminderInterval = 5; // Default reminder interval in seconds
let installationId;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ reminderInterval, reminderVolume: 1 });
  installationId = generateUniqueId();
  chrome.storage.local.set({ installationId });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === 'startReminder') {
    startReminder(message.reminderInterval);
  } else if (message.command === 'stopReminder') {
    stopReminder();
  } else if (message.command === 'sendAnalytics') {
    sendAnalytics(message.data);
  }
});

function startReminder(interval) {
  stopReminder(); // Clear any existing alarms
  chrome.alarms.create('reminderAlarm', { periodInMinutes: interval / 60 });
}

function stopReminder() {
  chrome.alarms.clear('reminderAlarm');
}

function generateUniqueId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function sendAnalytics(data) {
  chrome.storage.local.get('installationId', (result) => {
    const analyticsData = {
      ...data,
      installationId: result.installationId
    };
    
    fetch('https://your-api-endpoint.com/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(analyticsData),
    })
    .then(response => response.json())
    .then(data => console.log('Analytics sent successfully'))
    .catch((error) => console.error('Error:', error));
  });
}