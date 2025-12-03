/**
 * Jest Test Setup for Notification Service
 */

import { jest } from '@jest/globals';

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/notification_test';
process.env.KAFKA_BROKERS = 'localhost:9092';
process.env.TWILIO_ACCOUNT_SID = 'test_account_sid';
process.env.TWILIO_AUTH_TOKEN = 'test_auth_token';
process.env.SMTP_HOST = 'smtp.test.com';
process.env.SMTP_USER = 'test@test.com';
process.env.SMTP_PASS = 'test_password';

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
