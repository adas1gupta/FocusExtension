// tests/integration/sessionSimulatation.test.js
import sinon from 'sinon';
import { sendAnalytics } from '../../src/background.js';

describe('Session Simulation', () => {
  beforeEach(() => {
    // Mock chrome.storage
    sinon.stub(chrome.storage.sync, 'set');
    sinon.stub(chrome.storage.sync, 'get').callsFake((key, callback) => {
      callback({ [key]: 'mocked value' });
    });
    // Mock other Chrome extension APIs as needed
    // ...
  });

  afterEach(() => {
    // Restore the mocked APIs
    sinon.restore();
  });

  async function runTestSessions(count) {
    for (let i = 0; i < count; i++) {
      const testData = {
        sessionType: i % 2 === 0 ? 'study' : 'break',
        duration: Math.random() * 3600, // Random duration up to 1 hour
        reminderInterval: 5,
        reminderVolume: Math.random(),
        timeOfDayStarted: new Date().toISOString(),
        // ... other necessary fields
      };
      await sendAnalytics(testData);
      console.log(`Test session ${i + 1} completed`);
    }
  }

  // Function to run the tests
  async function runTests() {
    console.log('Starting test sessions...');
    await runTestSessions(10);
    console.log('Test sessions completed.');
  }

  // Run the tests
  test('Simulate multiple sessions', async () => {
    await runTests();
  });
});