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
const storage: { [key: string]: string } = {};
const localStorageMock: Storage = {
  getItem: vi.fn((key: string) => Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null),
  setItem: vi.fn((key: string, value: string) => {
    storage[key] = String(value);
  }),
  removeItem: vi.fn((key: string) => {
    delete storage[key];
  }),
  clear: vi.fn(() => {
    for (const key in storage) {
      delete storage[key];
    }
  }),
  get length(): number {
    return Object.keys(storage).length;
  },
  key: vi.fn((index: number): string | null => {
    const keys = Object.keys(storage);
    return keys[index] ?? null;
  }),
};

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Suppress console errors in tests
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
};

