/**
 * Session Key Service Tests
 * Comprehensive unit tests for session key validation and management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sessionKeyService } from '../session-key.service';
import { SessionKey, SessionPermissions } from '@/types/wallet.types';
import * as fc from 'fast-check';

// Mock secure storage
vi.mock('@/lib/secure-storage', () => ({
  getSecureStorage: () => ({
    hasPassword: () => true,
    storeSessionKey: vi.fn(),
    revokeSessionKey: vi.fn(),
    getAllSessionKeys: vi.fn().mockResolvedValue([]),
  }),
  SessionKeyPermissions: {},
}));

// Note: generateSessionKey tests are skipped as they require Node.js crypto 
// which doesn't work in jsdom environment. These are covered in integration tests.

describe('SessionKeyService', () => {
  describe('validatePermissions', () => {
    const createSessionKey = (
      permissions: Partial<SessionPermissions>,
      expiresInMs: number = 3600000 // 1 hour
    ): SessionKey => ({
      publicKey: '0x1234567890123456789012345678901234567890',
      privateKey: '0x' + 'a'.repeat(64),
      permissions: {
        allowedContracts: permissions.allowedContracts,
        allowedFunctions: permissions.allowedFunctions,
        spendingLimit: permissions.spendingLimit,
        timeLimit: permissions.timeLimit,
        chainIds: permissions.chainIds,
      },
      expiresAt: Date.now() + expiresInMs,
      createdAt: Date.now(),
    });

    it('should return valid for unrestricted transaction', () => {
      const sessionKey = createSessionKey({});
      const transaction = {
        to: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        value: '1000000000000000000', // 1 ETH
        data: '0x',
        chainId: 1,
      };

      const result = sessionKeyService.validatePermissions(sessionKey, transaction);

      expect(result.valid).toBe(true);
    });

    it('should reject expired session keys', () => {
      const sessionKey = createSessionKey({}, -1000); // Already expired
      const transaction = {
        to: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        value: '1000000000000000000',
        data: '0x',
        chainId: 1,
      };

      const result = sessionKeyService.validatePermissions(sessionKey, transaction);

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('expired');
    });

    it('should enforce spending limits', () => {
      const sessionKey = createSessionKey({
        spendingLimit: '500000000000000000', // 0.5 ETH
      });
      const transaction = {
        to: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        value: '1000000000000000000', // 1 ETH - exceeds limit
        data: '0x',
        chainId: 1,
      };

      const result = sessionKeyService.validatePermissions(sessionKey, transaction);

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('spending limit');
    });

    it('should enforce allowed contracts', () => {
      const allowedContract = '0x1111111111111111111111111111111111111111';
      const sessionKey = createSessionKey({
        allowedContracts: [allowedContract],
      });
      const transaction = {
        to: '0x2222222222222222222222222222222222222222', // Not in allowed list
        value: '0',
        data: '0x',
        chainId: 1,
      };

      const result = sessionKeyService.validatePermissions(sessionKey, transaction);

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('not in allowed list');
    });

    it('should enforce allowed functions', () => {
      const sessionKey = createSessionKey({
        allowedFunctions: ['0xa9059cbb'], // transfer function
      });
      const transaction = {
        to: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        value: '0',
        data: '0x12345678', // Different function selector
        chainId: 1,
      };

      const result = sessionKeyService.validatePermissions(sessionKey, transaction);

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Function not in allowed list');
    });

    it('should enforce allowed chains', () => {
      const sessionKey = createSessionKey({
        chainIds: [1, 137], // Only Ethereum and Polygon
      });
      const transaction = {
        to: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        value: '1000000000000000000',
        data: '0x',
        chainId: 42161, // Arbitrum - not allowed
      };

      const result = sessionKeyService.validatePermissions(sessionKey, transaction);

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Chain not in allowed list');
    });

    // Property-based tests
    it('should handle any valid spending limit correctly', () => {
      fc.assert(
        fc.property(
          fc.bigInt({ min: 0n, max: 1000000000000000000000n }),
          fc.bigInt({ min: 0n, max: 1000000000000000000000n }),
          (limit, value) => {
            const sessionKey = createSessionKey({
              spendingLimit: limit.toString(),
            });
            const transaction = {
              to: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
              value: value.toString(),
              data: '0x',
              chainId: 1,
            };

            const result = sessionKeyService.validatePermissions(sessionKey, transaction);

            if (value <= limit) {
              expect(result.valid).toBe(true);
            } else {
              expect(result.valid).toBe(false);
            }
          }
        )
      );
    });
  });

  describe('isExpired', () => {
    it('should return true for expired keys', () => {
      const sessionKey: SessionKey = {
        publicKey: '0x1234567890123456789012345678901234567890',
        privateKey: '0x' + 'a'.repeat(64),
        permissions: {},
        expiresAt: Date.now() - 1000, // 1 second ago
        createdAt: Date.now() - 3600000,
      };

      expect(sessionKeyService.isExpired(sessionKey)).toBe(true);
    });

    it('should return false for valid keys', () => {
      const sessionKey: SessionKey = {
        publicKey: '0x1234567890123456789012345678901234567890',
        privateKey: '0x' + 'a'.repeat(64),
        permissions: {},
        expiresAt: Date.now() + 3600000, // 1 hour from now
        createdAt: Date.now(),
      };

      expect(sessionKeyService.isExpired(sessionKey)).toBe(false);
    });
  });

  describe('getRemainingTime', () => {
    it('should return correct remaining time', () => {
      const sessionKey: SessionKey = {
        publicKey: '0x1234567890123456789012345678901234567890',
        privateKey: '0x' + 'a'.repeat(64),
        permissions: {},
        expiresAt: Date.now() + 30000, // 30 seconds from now
        createdAt: Date.now(),
      };

      const remaining = sessionKeyService.getRemainingTime(sessionKey);

      expect(remaining).toBeGreaterThan(25000);
      expect(remaining).toBeLessThanOrEqual(30000);
    });

    it('should return 0 for expired keys', () => {
      const sessionKey: SessionKey = {
        publicKey: '0x1234567890123456789012345678901234567890',
        privateKey: '0x' + 'a'.repeat(64),
        permissions: {},
        expiresAt: Date.now() - 1000,
        createdAt: Date.now() - 3600000,
      };

      expect(sessionKeyService.getRemainingTime(sessionKey)).toBe(0);
    });
  });

  describe('getRemainingAllowance', () => {
    it('should return max uint256 when no limit set', () => {
      const sessionKey: SessionKey = {
        publicKey: '0x1234567890123456789012345678901234567890',
        privateKey: '0x' + 'a'.repeat(64),
        permissions: {},
        expiresAt: Date.now() + 3600000,
        createdAt: Date.now(),
      };

      const remaining = sessionKeyService.getRemainingAllowance(sessionKey, '1000000');

      expect(BigInt(remaining)).toBeGreaterThan(BigInt('1000000000000000000000000'));
    });

    it('should calculate remaining correctly', () => {
      const sessionKey: SessionKey = {
        publicKey: '0x1234567890123456789012345678901234567890',
        privateKey: '0x' + 'a'.repeat(64),
        permissions: {
          spendingLimit: '1000000000000000000', // 1 ETH
        },
        expiresAt: Date.now() + 3600000,
        createdAt: Date.now(),
      };

      const remaining = sessionKeyService.getRemainingAllowance(
        sessionKey,
        '200000000000000000' // 0.2 ETH spent
      );

      expect(remaining).toBe('800000000000000000'); // 0.8 ETH remaining
    });

    it('should return 0 when spent exceeds limit', () => {
      const sessionKey: SessionKey = {
        publicKey: '0x1234567890123456789012345678901234567890',
        privateKey: '0x' + 'a'.repeat(64),
        permissions: {
          spendingLimit: '1000000000000000000', // 1 ETH
        },
        expiresAt: Date.now() + 3600000,
        createdAt: Date.now(),
      };

      const remaining = sessionKeyService.getRemainingAllowance(
        sessionKey,
        '2000000000000000000' // 2 ETH spent
      );

      expect(remaining).toBe('0');
    });
  });
});
