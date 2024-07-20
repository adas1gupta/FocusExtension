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

function storeFailedRequest(data) {
  chrome.storage.local.get({failedRequests: []}, function(result) {
    let failedRequests = result.failedRequests;
    failedRequests.push({
      data: data,
      timestamp: new Date().getTime()
    });
    chrome.storage.local.set({failedRequests: failedRequests}, function() {
      console.log('Failed request stored');
    });
  });
}

async function anonymizeData(data) {
  // Create a copy of the data to avoid modifying the original
  let anonymizedData = { ...data };
  
  // Remove or hash any personally identifiable information
  if (anonymizedData.installationId) {
    anonymizedData.installationId = await hashString(anonymizedData.installationId);
  }
  
  // Round time to nearest hour to reduce precision
  if (anonymizedData.timeOfDayStarted) {
    let date = new Date(anonymizedData.timeOfDayStarted);
    date.setMinutes(0, 0, 0);
    anonymizedData.timeOfDayStarted = date.toISOString();
  }
  
  // Round duration to nearest minute
  if (anonymizedData.duration) {
    anonymizedData.duration = Math.round(anonymizedData.duration / 60) * 60;
  }
  
  return anonymizedData;
}

async function hashString(str) {
  const utf8 = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

async function sendAnalytics(data) {
  chrome.storage.local.get(['installationId', 'dailyStats'], async (result) => {
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

    const anonymizedData = await anonymizeData(analyticsData);
    
    fetch('http://localhost:3000/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(anonymizedData),
    })
    
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => console.log('Analytics sent successfully:', data))
    .catch((error) => {
      console.error('Error sending analytics:', error);
      storeFailedRequest(analyticsData);
    });
  });
}

function resendFailedRequests() {
  chrome.storage.local.get({failedRequests: []}, function(result) {
    let failedRequests = result.failedRequests;
    if (failedRequests.length === 0) {
      console.log('No failed requests to resend');
      return;
    }

    console.log(`Attempting to resend ${failedRequests.length} failed requests`);

    let successfulRequests = [];

    failedRequests.forEach((request, index) => {
      fetch('http://localhost:3000/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request.data),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Failed request resent successfully:', data);
        successfulRequests.push(index);
      })
      .catch((error) => {
        console.error('Error resending failed request:', error);
      })
      .finally(() => {
        if (index === failedRequests.length - 1) {
          // Remove successful requests from storage
          failedRequests = failedRequests.filter((_, i) => !successfulRequests.includes(i));
          chrome.storage.local.set({failedRequests: failedRequests}, function() {
            console.log(`${successfulRequests.length} failed requests resent successfully`);
          });
        }
      });
    });
  });
}

// Attempt to resend failed requests every hour
chrome.alarms.create('resendFailedRequests', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'resendFailedRequests') {
    resendFailedRequests();
  }
});

// At the end of background.js, replace the direct addListener call with this:
function setupOnStartupListener() {
  if (chrome.runtime && chrome.runtime.onStartup) {
    chrome.runtime.onStartup.addListener(resendFailedRequests);
  }
}

setupOnStartupListener();

module.exports = {
  startReminder,
  stopReminder,
  generateUniqueId,
  storeFailedRequest,
  anonymizeData,
  hashString,
  sendAnalytics,
  resendFailedRequests,
  setupOnStartupListener,
  
};