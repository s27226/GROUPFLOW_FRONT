import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { server } from './mocks/server';

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Reset handlers after each test  
afterEach(() => {
  server.resetHandlers();
  cleanup();
  localStorage.clear();
});

// Stop MSW server after all tests
afterAll(() => server.close());

// Mock localStorage with actual storage
const storage = {};
const localStorageMock = {
  getItem: vi.fn((key) => storage.hasOwnProperty(key) ? storage[key] : null),
  setItem: vi.fn((key, value) => {
    storage[key] = String(value);
  }),
  removeItem: vi.fn((key) => {
    delete storage[key];
  }),
  clear: vi.fn(() => {
    for (const key in storage) {
      delete storage[key];
    }
  }),
};

global.localStorage = localStorageMock;

// Suppress console errors in tests (optional)
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
};

