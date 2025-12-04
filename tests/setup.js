/**
 * Jest Setup File
 * Global setup for all tests
 */

// Increase timeout for async operations
jest.setTimeout(30000);

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
console.error = (...args) => {
  // Filter out specific noise
  const message = args[0]?.toString() || '';
  if (
    message.includes('Warning:') ||
    message.includes('act(...)') ||
    message.includes('ReactDOM.render')
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

// Global test utilities
global.testUtils = {
  // Generate random string
  randomString: (length = 10) => {
    return Math.random().toString(36).substring(2, length + 2);
  },
  
  // Generate random email
  randomEmail: () => {
    return `test-${Date.now()}@example.com`;
  },
  
  // Generate random phone
  randomPhone: () => {
    return `+84${Math.floor(Math.random() * 900000000 + 100000000)}`;
  },
  
  // Wait helper
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Mock authenticated user
  mockAuthUser: (role = 'user') => ({
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    name: 'Test User',
    role: role,
    isVerified: true
  })
};

// Cleanup after all tests
afterAll(async () => {
  // Close any open connections
  await new Promise(resolve => setTimeout(resolve, 500));
});
