/**
 * Jest Test Setup for Payment Service
 */

import { jest } from '@jest/globals';

process.env.NODE_ENV = 'test';
process.env.STRIPE_SECRET_KEY = 'sk_test_dummy_key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/payment_test';

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
