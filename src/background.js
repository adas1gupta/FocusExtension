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
  chrome.storage.local.get(['installationId', 'dailyStats'], (result) => {
    const today = new Date().toDateString();
    const dailyStats = result.dailyStats || {};
    if (!dailyStats[today]) {
      dailyStats[today] = { studySessions: 0, completedSessions: 0, startedSessions: 0 };
    }
    dailyStats[today].studySessions += (data.sessionType === 'study' ? 1 : 0);
    dailyStats[today].completedSessions += 1;
    dailyStats[today].startedSessions += 1;

    const analyticsData = {
      ...data,
      installationId: result.installationId,
      dailyStudySessions: dailyStats[today].studySessions,
      completionRate: dailyStats[today].completedSessions / dailyStats[today].startedSessions
    };

    chrome.storage.local.set({ dailyStats });

    fetch('http://localhost:3000/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(analyticsData),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();  // Change this from response.json() to response.text()
    })
    .then(data => console.log('Analytics sent successfully:', data))
    .catch((error) => console.error('Error sending analytics:', error));
  });
}