const { 
  generateUniqueId, 
  anonymizeData, 
  sendAnalytics, 
  startReminder,
  stopReminder,
  storeFailedRequest,
  resendFailedRequests,
  setupOnStartupListener
} = require('../../src/background');

// Mock chrome API
global.chrome = {
  alarms: {
    create: jest.fn(),
    clear: jest.fn()
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn()
    },
    sync: {
      set: jest.fn()
    }
  },
  runtime: {
    onStartup: {
      addListener: jest.fn()
    }
  }
};

describe('Background Script', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));
  });

  test('generateUniqueId creates a unique ID', () => {
    const id1 = generateUniqueId();
    const id2 = generateUniqueId();
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  test('anonymizeData properly anonymizes data', async () => {
    const testData = {
      installationId: 'test-id',
      timeOfDayStarted: '2023-06-12T10:30:15.000Z',
      duration: 1500
    };
    const anonymizedData = await anonymizeData(testData);
    expect(anonymizedData.installationId).not.toBe('test-id');
    expect(anonymizedData.timeOfDayStarted).toBe('2023-06-12T10:00:00.000Z');
    expect(anonymizedData.duration).toBe(1500);
  });

  test('sendAnalytics sends data correctly', async () => {
    const testData = { sessionType: 'study', duration: 1500 };
    await sendAnalytics(testData);
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/analytics', expect.any(Object));
  });

  test('startReminder creates an alarm', () => {
    startReminder(5);
    expect(chrome.alarms.clear).toHaveBeenCalledWith('reminderAlarm');
    expect(chrome.alarms.create).toHaveBeenCalledWith('reminderAlarm', { periodInMinutes: 5/60 });
  });

  test('stopReminder clears the alarm', () => {
    stopReminder();
    expect(chrome.alarms.clear).toHaveBeenCalledWith('reminderAlarm');
  });

  test('storeFailedRequest stores failed request', () => {
    const testData = { sessionType: 'study', duration: 1500 };
    storeFailedRequest(testData);
    expect(chrome.storage.local.get).toHaveBeenCalled();
    expect(chrome.storage.local.set).toHaveBeenCalled();
  });

  test('resendFailedRequests attempts to resend failed requests', () => {
    const mockFailedRequests = [{ data: { sessionType: 'study', duration: 1500 }, timestamp: Date.now() }];
    chrome.storage.local.get.mockImplementation((key, callback) => callback({ failedRequests: mockFailedRequests }));
    resendFailedRequests();
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/analytics', expect.any(Object));
  });

  test('setupOnStartupListener sets up the listener correctly', () => {
    setupOnStartupListener();
    expect(chrome.runtime.onStartup.addListener).toHaveBeenCalled();
  });
});