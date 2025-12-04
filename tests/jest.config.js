/**
 * Jest Configuration for FastFood Delivery
 * Centralized test configuration with metrics reporting
 */

module.exports = {
  testEnvironment: 'node',
  
  // Test patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
    '**/__tests__/**/*.js'
  ],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: '<rootDir>/test-reports/coverage',
  coverageReporters: ['text', 'lcov', 'json-summary', 'html'],
  collectCoverageFrom: [
    '**/controllers/**/*.js',
    '**/services/**/*.js',
    '**/middleware/**/*.js',
    '**/utils/**/*.js',
    '**/model/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  
  // Reporters - includes custom metrics reporter
  reporters: [
    'default',
    ['<rootDir>/tests/reporters/metrics-reporter.js', {
      verbose: true
    }],
    ['jest-junit', {
      outputDirectory: '<rootDir>/test-reports',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true,
      suiteName: 'FastFood Delivery Tests'
    }]
  ],
  
  // JSON output for metrics exporter
  json: true,
  outputFile: '<rootDir>/test-reports/test-results.json',
  
  // Timeout
  testTimeout: 30000,
  
  // Verbose output
  verbose: true,
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Module paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  
  // Force exit after tests
  forceExit: true,
  
  // Detect open handles
  detectOpenHandles: true,
  
  // Max workers
  maxWorkers: '50%'
};
