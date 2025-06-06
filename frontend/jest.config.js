module.exports = {
  // Test environment for DOM testing
  testEnvironment: 'jsdom',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Test file patterns
  testMatch: ['<rootDir>/tests/**/*.test.js', '<rootDir>/tests/**/*.spec.js'],

  // Module file extensions
  moduleFileExtensions: ['js', 'json'],

  // Transform files dengan Babel
  transform: {
    '^.+\\.js$': 'babel-jest',
  },

  // Coverage configuration
  collectCoverageFrom: ['src/**/*.js', '!src/**/*.test.js', '!src/**/*.spec.js', '!src/output.css'],

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
    // Handle CSS imports (jika ada)
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },

  // Ignore patterns
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],

  // Transform ignore patterns (untuk node_modules yang perlu di-transform)
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$))'],

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,
};
