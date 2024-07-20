jest.mock('../../src/background', () => ({
  sendAnalytics: jest.fn().mockImplementation((data) => {
    return Promise.resolve(fetch('http://localhost:3000/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }));
  }),
  setupOnStartupListener: jest.fn(),
}));

const { sendAnalytics } = require('../../src/background');

describe('Session Simulation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  async function runTestSessions(count) {
    for (let i = 0; i < count; i++) {
      const testData = {
        sessionType: i % 2 === 0 ? 'study' : 'break',
        duration: Math.random() * 3600,
        reminderInterval: 5,
        reminderVolume: Math.random(),
        timeOfDayStarted: new Date().toISOString(),
      };
      await sendAnalytics(testData);
      console.log(`Test session ${i + 1} completed`);
    }
  }

  test('Simulate multiple sessions', async () => {
    await runTestSessions(10);
    expect(global.fetch).toHaveBeenCalledTimes(10);
  });
});