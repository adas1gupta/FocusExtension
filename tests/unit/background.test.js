// tests/unit/background.test.js
import { chrome } from 'jest-chrome';
global.chrome = chrome;
const { generateUniqueId } = require('../../src/background');

describe('Background', () => {
  test('generateUniqueId creates a string', () => {
    const id = generateUniqueId();
    expect(typeof id).toBe('string');
  });

  test('generateUniqueId creates unique ids', () => {
    const id1 = generateUniqueId();
    const id2 = generateUniqueId();
    expect(id1).not.toBe(id2);
  });
});