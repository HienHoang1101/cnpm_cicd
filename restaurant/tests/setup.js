/**
 * Jest Test Setup for Restaurant Service
 */

import { jest } from '@jest/globals';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/restaurant_test';

global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: console.error
};

beforeAll(() => {});
afterAll(() => { jest.clearAllMocks(); });
beforeEach(() => { jest.clearAllMocks(); });
