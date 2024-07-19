// tests/integration/sessionSimulation.test.js

// Import necessary functions from your main code
// You might need to adjust your main code to make these functions importable
import { sendAnalytics } from '../../src/background.js';

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
runTests().catch(console.error);