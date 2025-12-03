/**
 * Jest Test Setup for Order Service
 */

import { jest } from '@jest/globals';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.MONGODB_URI_Order = 'mongodb://localhost:27017/order_test';
process.env.AUTH_SERVICE_URL = 'http://localhost:5001';
process.env.RESTAURANT_SERVICE_URL = 'http://localhost:5003';

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
