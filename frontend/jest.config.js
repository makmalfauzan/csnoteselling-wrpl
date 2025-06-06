module.exports = {
  // Test environment for DOM testing
  testEnvironment: 'jsdom',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Test file patterns
  testMatch: ['<rootDir>/tests/**/*.test.js', '<rootDir>/tests/**/*.spec.js'],

  // Module file extensions
  moduleFileExtensions: ['js', 'json'],

  // Transform files (tidak perlu untuk vanilla JS)
  transform: {},

  // Coverage configuration
  collectCoverageFrom: ['src/**/*.js', '!src/**/*.test.js', '!src/**/*.spec.js'],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },

  // Module name mapping for absolute imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Ignore patterns
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],

  // Verbose output
  verbose: true,
};
