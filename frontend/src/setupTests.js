import '@testing-library/jest-dom';

// Mock window.matchMedia for Jest environment
// This must be set up before any components are imported
global.matchMedia = global.matchMedia || function(query) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };
};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: global.matchMedia,
});

// Mock axios to avoid ES module issues in Jest
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
      defaults: {
        headers: {
          common: {}
        }
      }
    })),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn()
  }
}));








