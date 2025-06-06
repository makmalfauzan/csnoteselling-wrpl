// Import Jest DOM matchers
import '@testing-library/jest-dom';

// Global test setup
beforeEach(() => {
  // Clean up DOM before each test
  document.body.innerHTML = '';

  // Reset any global variables if needed
  // window.location = new URL('http://localhost:8080');
});

// Mock console methods untuk mengurangi noise di test output
global.console = {
  ...console,
  // Uncomment to hide console.log in tests
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Mock window.fetch jika diperlukan untuk API calls
global.fetch = jest.fn();

// Setup untuk testing DOM manipulation
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:8080',
    origin: 'http://localhost:8080',
  },
  writable: true,
});

// Mock localStorage dan sessionStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;
global.sessionStorage = localStorageMock;
