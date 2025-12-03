/**
 * Jest Test Setup for Auth Service
 * Runs before each test file
 */

import { jest } from '@jest/globals';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.MONGO_URI_Auth = 'mongodb://localhost:27017/auth_test';

// Mock console to reduce noise during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: console.error
};

// Global beforeAll
beforeAll(() => {
  // Any global setup
});

// Global afterAll
afterAll(() => {
  // Cleanup
  jest.clearAllMocks();
});

// Global beforeEach
beforeEach(() => {
  jest.clearAllMocks();
});
