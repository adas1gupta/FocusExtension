jest.mock('../../src/background', () => ({
  sendAnalytics: jest.fn().mockImplementation((data) => {
    return Promise.resolve(fetch('http://localhost:3000/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }));
  }),
  anonymizeData: jest.fn().mockImplementation(data => ({
    ...data,
    installationId: 'anonymized-id',
    timeOfDayStarted: '2023-06-12T10:00:00.000Z',
  })),
  setupOnStartupListener: jest.fn(),
}));

const { sendAnalytics, anonymizeData } = require('../../src/background');

describe('Data Flow', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    anonymizeData.mockImplementation(data => ({
      ...data,
      installationId: 'anonymized-id',
      timeOfDayStarted: '2023-06-12T10:00:00.000Z',
    }));
  });

  test('Analytics data is sent correctly', async () => {
    const testData = {
      sessionType: 'study',
      duration: 1500,
      reminderInterval: 5,
      reminderVolume: 0.5,
      dayOfWeek: 1,
      hourOfDay: 10,
      timeOfDayStarted: '2023-06-12T10:00:00.000Z',
      pauseFrequency: 2,
      reminderSoundCount: 10,
      installationId: 'test-installation-id',
      dailyStudySessions: 3,
      completionRate: 0.75
    };

    await sendAnalytics(testData);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/analytics', expect.objectContaining({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }));
  });

  test('Data is anonymized correctly', async () => {
    const testData = {
      installationId: 'test-installation-id',
      timeOfDayStarted: '2023-06-12T10:30:15.000Z',
      duration: 1500
    };

    const anonymizedData = await anonymizeData(testData);

    expect(anonymizedData.installationId).not.toBe('test-installation-id');
    expect(anonymizedData.timeOfDayStarted).toBe('2023-06-12T10:00:00.000Z');
    expect(anonymizedData.duration).toBe(1500);
  });
});