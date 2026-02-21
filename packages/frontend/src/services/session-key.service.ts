/**
 * Session Key Service
 * Manages session key generation, validation, and storage
 * Requirements: FR-6.1, FR-6.2, FR-6.4
 */

import { ethers } from 'ethers';
import { SessionKey, SessionPermissions } from '@/types/wallet.types';
import { getSecureStorage, SessionKeyPermissions } from '@/lib/secure-storage';

/**
 * Session Key Service
 * Handles creation, validation, and management of session keys
 */
export class SessionKeyService {
  private static instance: SessionKeyService;

  private constructor() {}

  static getInstance(): SessionKeyService {
    if (!SessionKeyService.instance) {
      SessionKeyService.instance = new SessionKeyService();
    }
    return SessionKeyService.instance;
  }

  /**
   * Generate a new session key pair
   */
  async generateSessionKey(): Promise<{ publicKey: string; privateKey: string }> {
    const wallet = ethers.Wallet.createRandom();
    return {
      publicKey: wallet.address,
      privateKey: wallet.privateKey,
    };
  }

  /**
   * Create a new session key with permissions
   */
  async createSessionKey(
    permissions: SessionPermissions,
    durationMs: number
  ): Promise<SessionKey> {
    const keyPair = await this.generateSessionKey();
    const now = Date.now();
    const expiresAt = now + durationMs;

    const sessionKey: SessionKey = {
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
      permissions,
      expiresAt,
      createdAt: now,
    };

    // Store in secure storage
    const storage = getSecureStorage();
    if (storage.hasPassword()) {
      await storage.storeSessionKey(
        keyPair.publicKey,
        keyPair.privateKey,
        this.mapPermissionsToStorage(permissions),
        expiresAt
      );
    }

    return sessionKey;
  }

  /**
   * Validate session key permissions for a transaction
   */
  validatePermissions(
    sessionKey: SessionKey,
    transaction: {
      to: string;
      value: string;
      data: string;
      chainId: number;
    }
  ): { valid: boolean; reason?: string } {
    const now = Date.now();

    // Check expiration
    if (sessionKey.expiresAt < now) {
      return { valid: false, reason: 'Session key has expired' };
    }

    const { permissions } = sessionKey;

    // Check time limit
    if (permissions.timeLimit && now - sessionKey.createdAt > permissions.timeLimit) {
      return { valid: false, reason: 'Session key time limit exceeded' };
    }

    // Check spending limit
    if (permissions.spendingLimit) {
      const txValue = BigInt(transaction.value);
      const limit = BigInt(permissions.spendingLimit);
      if (txValue > limit) {
        return { valid: false, reason: 'Transaction value exceeds spending limit' };
      }
    }

    // Check allowed contracts
    if (permissions.allowedContracts && permissions.allowedContracts.length > 0) {
      const targetLower = transaction.to.toLowerCase();
      const isAllowed = permissions.allowedContracts.some(
        (addr) => addr.toLowerCase() === targetLower
      );
      if (!isAllowed) {
        return { valid: false, reason: 'Target contract not in allowed list' };
      }
    }

    // Check allowed functions
    if (permissions.allowedFunctions && permissions.allowedFunctions.length > 0) {
      if (transaction.data && transaction.data !== '0x') {
        const functionSelector = transaction.data.slice(0, 10).toLowerCase();
        const isAllowed = permissions.allowedFunctions.some(
          (selector) => selector.toLowerCase() === functionSelector
        );
        if (!isAllowed) {
          return { valid: false, reason: 'Function not in allowed list' };
        }
      }
    }

    // Check allowed chains
    if (permissions.chainIds && permissions.chainIds.length > 0) {
      if (!permissions.chainIds.includes(transaction.chainId)) {
        return { valid: false, reason: 'Chain not in allowed list' };
      }
    }

    return { valid: true };
  }

  /**
   * Check if session key is expired
   */
  isExpired(sessionKey: SessionKey): boolean {
    return sessionKey.expiresAt < Date.now();
  }

  /**
   * Get remaining time for session key
   */
  getRemainingTime(sessionKey: SessionKey): number {
    const remaining = sessionKey.expiresAt - Date.now();
    return remaining > 0 ? remaining : 0;
  }

  /**
   * Get remaining spending allowance
   */
  getRemainingAllowance(
    sessionKey: SessionKey,
    spentAmount: string
  ): string {
    if (!sessionKey.permissions.spendingLimit) {
      return ethers.MaxUint256.toString();
    }

    const limit = BigInt(sessionKey.permissions.spendingLimit);
    const spent = BigInt(spentAmount);

    if (spent >= limit) {
      return '0';
    }

    return (limit - spent).toString();
  }

  /**
   * Revoke a session key
   */
  async revokeSessionKey(publicKey: string): Promise<void> {
    const storage = getSecureStorage();
    if (storage.hasPassword()) {
      await storage.revokeSessionKey(publicKey);
    }
  }

  /**
   * Get all active session keys from storage
   */
  async getActiveSessionKeys(): Promise<
    Array<{
      publicKey: string;
      permissions: SessionPermissions;
      expiresAt: number;
      createdAt: number;
    }>
  > {
    const storage = getSecureStorage();
    if (!storage.hasPassword()) {
      return [];
    }

    const keys = await storage.getAllSessionKeys();
    return keys.map((k) => ({
      publicKey: k.publicKey,
      permissions: this.mapStorageToPermissions(k.permissions),
      expiresAt: k.expiresAt,
      createdAt: k.createdAt,
    }));
  }

  /**
   * Sign a transaction with session key
   */
  async signWithSessionKey(
    sessionKey: SessionKey,
    transaction: {
      to: string;
      value: string;
      data: string;
      nonce: number;
      chainId: number;
    }
  ): Promise<string> {
    // Validate permissions first
    const validation = this.validatePermissions(sessionKey, transaction);
    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    // Create wallet from private key
    const wallet = new ethers.Wallet(sessionKey.privateKey);

    // Sign the transaction
    const tx = {
      to: transaction.to,
      value: transaction.value,
      data: transaction.data,
      nonce: transaction.nonce,
      chainId: transaction.chainId,
      gasLimit: 100000n, // Default, should be estimated
      gasPrice: 0n, // Will be set by relayer or paymaster
    };

    return await wallet.signTransaction(tx);
  }

  /**
   * Map permissions to storage format
   */
  private mapPermissionsToStorage(permissions: SessionPermissions): SessionKeyPermissions {
    return {
      allowedContracts: permissions.allowedContracts,
      allowedFunctions: permissions.allowedFunctions,
      spendingLimit: permissions.spendingLimit,
      timeLimit: permissions.timeLimit,
      chainIds: permissions.chainIds,
    };
  }

  /**
   * Map storage format to permissions
   */
  private mapStorageToPermissions(storage: SessionKeyPermissions): SessionPermissions {
    return {
      allowedContracts: storage.allowedContracts,
      allowedFunctions: storage.allowedFunctions,
      spendingLimit: storage.spendingLimit,
      timeLimit: storage.timeLimit,
      chainIds: storage.chainIds,
    };
  }
}

// Export singleton instance
export const sessionKeyService = SessionKeyService.getInstance();