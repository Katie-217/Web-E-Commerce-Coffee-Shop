import '@testing-library/jest-dom';

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

// Mock lib/api.js to avoid import issues
jest.mock('../lib/api', () => ({
  api: {
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
  },
  setAuthToken: jest.fn()
}));








