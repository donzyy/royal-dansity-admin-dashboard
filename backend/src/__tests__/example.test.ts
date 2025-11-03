/**
 * Example Test File
 * 
 * To run tests:
 *   npm test
 *   npm test -- --watch
 *   npm test -- --coverage
 * 
 * Install test dependencies:
 *   npm install -D @types/jest @types/node jest ts-jest
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('Example Test Suite', () => {
  beforeAll(() => {
    // Setup before all tests
    console.log('Test suite starting...');
  });

  afterAll(() => {
    // Cleanup after all tests
    console.log('Test suite completed');
  });

  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle async operations', async () => {
    const promise = Promise.resolve('test');
    const result = await promise;
    expect(result).toBe('test');
  });
});



