/**
 * Test Setup
 * Global test configuration and mocks
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock crypto.subtle for Web Crypto API
const subtleMock = {
  generateKey: vi.fn().mockResolvedValue({}),
  encrypt: vi.fn().mockResolvedValue(new ArrayBuffer(16)),
  decrypt: vi.fn().mockResolvedValue(new ArrayBuffer(16)),
  deriveKey: vi.fn().mockResolvedValue({}),
  importKey: vi.fn().mockResolvedValue({}),
  exportKey: vi.fn().mockResolvedValue({}),
  sign: vi.fn().mockResolvedValue(new ArrayBuffer(64)),
  verify: vi.fn().mockResolvedValue(true),
  digest: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
};

Object.defineProperty(window, 'crypto', {
  value: {
    subtle: subtleMock,
    getRandomValues: (array: Uint8Array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
  },
});

// Mock fetch
global.fetch = vi.fn();

// Reset all mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});