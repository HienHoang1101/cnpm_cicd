/**
 * Jest Test Setup for Admin Service
 */

import { jest } from '@jest/globals';

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/admin_test';
process.env.ORDER_SERVICE_URL = 'http://localhost:5002';

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
