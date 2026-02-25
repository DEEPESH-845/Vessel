/**
 * Session Key Service
 * Manages session key generation, validation, and storage
 * SECURE VERSION - Private keys are encrypted and never stored in plaintext
 * Requirements: FR-6.1, FR-6.2, FR-6.4
 * 
 * Updated to sync with AWS DynamoDB backend
 */

import { ethers } from 'ethers';
import { SessionKey, SessionPermissions } from '@/types/wallet.types';
import { backendAPI, SessionKeyData } from '@/lib/backend-client';

/**
 * Generate cryptographically secure random bytes
 */
function generateSecureRandomBytes(length: number): Uint8Array {
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto.getRandomValues(new Uint8Array(length));
  }
  // Node.js fallback
  const { randomBytes } = require('crypto');
  return new Uint8Array(randomBytes(length));
}

/**
 * Session Key Service
 * Handles creation, validation, and management of session keys
 * SECURITY: Private keys are encrypted using Web Crypto API before storage
 */
export class SessionKeyService {
  private static instance: SessionKeyService;
  private encryptedKeys: Map<string, { encrypted: string; iv: string }> = new Map();
  private masterKey: CryptoKey | null = null;

  private constructor() {}

  static getInstance(): SessionKeyService {
    if (!SessionKeyService.instance) {
      SessionKeyService.instance = new SessionKeyService();
    }
    return SessionKeyService.instance;
  }

  /**
   * Initialize the encryption key (should be called on app startup with user password)
   */
  async initializeWithPassword(password: string): Promise<void> {
    const passwordBuffer = new TextEncoder().encode(password);
    this.masterKey = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
  }

  /**
   * Derive encryption key from password
   */
  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const passwordBuffer = new TextEncoder().encode(password);
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );
    
    // Create a fresh Uint8Array copy to avoid SharedArrayBuffer issues
    const saltCopy = new Uint8Array(salt);
    
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltCopy,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt data using AES-GCM
   */
  private async encrypt(plaintext: string, key: CryptoKey): Promise<{ encrypted: string; iv: string }> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const plaintextBuffer = new TextEncoder().encode(plaintext);
    
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      plaintextBuffer
    );
    
    return {
      encrypted: this.arrayBufferToBase64(encryptedBuffer),
      iv: this.arrayBufferToBase64(iv.buffer as ArrayBuffer)
    };
  }

  /**
   * Decrypt data using AES-GCM
   */
  private async decrypt(encrypted: string, iv: string, key: CryptoKey): Promise<string> {
    const encryptedBuffer = this.base64ToArrayBuffer(encrypted);
    const ivBuffer = this.base64ToArrayBuffer(iv);
    
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBuffer },
      key,
      encryptedBuffer
    );
    
    return new TextDecoder().decode(decryptedBuffer);
  }

  /**
   * Convert ArrayBuffer to Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert Base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Generate a new session key pair using secure randomness
   * SECURITY: Uses Web Crypto API for cryptographically secure random generation
   */
  async generateSessionKey(): Promise<{ publicKey: string; privateKey: string }> {
    // Generate secure random wallet
    const randomBytes = generateSecureRandomBytes(32);
    const wallet = new ethers.Wallet(ethers.hexlify(randomBytes));
    
    return {
      publicKey: wallet.address,
      privateKey: wallet.privateKey,
    };
  }

  /**
   * Create a new session key with permissions
   * SECURITY: Private key is encrypted before storage
   */
  async createSessionKey(
    permissions: SessionPermissions,
    durationMs: number,
    userPassword?: string
  ): Promise<SessionKey> {
    const keyPair = await this.generateSessionKey();
    const now = Date.now();
    const expiresAt = now + durationMs;

    // Create session key object (without storing private key in plaintext)
    const sessionKey: SessionKey = {
      publicKey: keyPair.publicKey,
      privateKey: '', // Never store plaintext private key
      permissions,
      expiresAt,
      createdAt: now,
    };

    // If user password provided, encrypt the private key
    if (userPassword) {
      const salt = generateSecureRandomBytes(16);
      const encryptionKey = await this.deriveKey(userPassword, salt);
      const { encrypted, iv } = await this.encrypt(keyPair.privateKey, encryptionKey);
      
      // Store encrypted key with the public key as ID
      this.encryptedKeys.set(keyPair.publicKey, {
        encrypted,
        iv: this.arrayBufferToBase64(salt.buffer as ArrayBuffer) + ':' + iv
      });
    }

    return sessionKey;
  }

  /**
   * Retrieve decrypted private key (requires password)
   */
  async getPrivateKey(publicKey: string, userPassword: string): Promise<string | null> {
    const stored = this.encryptedKeys.get(publicKey);
    if (!stored) return null;

    try {
      const [saltBase64, iv] = stored.iv.split(':');
      const salt = new Uint8Array(this.base64ToArrayBuffer(saltBase64));
      const encryptionKey = await this.deriveKey(userPassword, salt);
      
      return await this.decrypt(stored.encrypted, iv, encryptionKey);
    } catch (error) {
      console.error('Failed to decrypt private key:', error);
      return null;
    }
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
    // Remove encrypted key from memory
    this.encryptedKeys.delete(publicKey);
  }

  /**
   * Get all active session keys (public keys only, not private)
   */
  async getActiveSessionKeys(): Promise<
    Array<{
      publicKey: string;
      permissions: SessionPermissions;
      expiresAt: number;
      createdAt: number;
    }>
  > {
    // Return only public key metadata, never private keys
    return Array.from(this.encryptedKeys.keys()).map(publicKey => ({
      publicKey,
      permissions: {}, // Would be loaded from storage
      expiresAt: Date.now() + 3600000, // Placeholder
      createdAt: Date.now()
    }));
  }

  /**
   * Sign a transaction with session key
   * SECURITY: Requires password to decrypt private key for signing
   */
  async signWithSessionKey(
    sessionKey: SessionKey,
    transaction: {
      to: string;
      value: string;
      data: string;
      nonce: number;
      chainId: number;
    },
    userPassword: string
  ): Promise<string> {
    // Validate permissions first
    const validation = this.validatePermissions(sessionKey, transaction);
    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    // Get decrypted private key (requires password)
    const privateKey = await this.getPrivateKey(sessionKey.publicKey, userPassword);
    if (!privateKey) {
      throw new Error('Failed to retrieve session key. Invalid password?');
    }

    // Create wallet from private key
    const wallet = new ethers.Wallet(privateKey);

    // Sign the transaction
    const tx = {
      to: transaction.to,
      value: transaction.value,
      data: transaction.data,
      nonce: transaction.nonce,
      chainId: transaction.chainId,
      gasLimit: 100000n,
      gasPrice: 0n,
    };

    return await wallet.signTransaction(tx);
  }
}

// Export singleton instance
export const sessionKeyService = SessionKeyService.getInstance();

// ==================== BACKEND SYNC METHODS ====================
// These methods sync session keys with the AWS DynamoDB backend

/**
 * Sync session key to backend DynamoDB
 */
export async function syncSessionKeyToBackend(
  userId: string,
  sessionKey: SessionKey
): Promise<boolean> {
  try {
    const result = await backendAPI.storeSessionKey({
      userId,
      publicKey: sessionKey.publicKey,
      permissions: sessionKey.permissions,
      expiresAt: new Date(sessionKey.expiresAt).toISOString(),
    });

    return result.success;
  } catch (error) {
    console.error('Failed to sync session key to backend:', error);
    return false;
  }
}

/**
 * Get session keys from backend
 */
export async function getSessionKeysFromBackend(
  userId: string
): Promise<SessionKeyData[]> {
  try {
    const result = await backendAPI.getSessionKeysByUser(userId);
    
    if (result.success && result.data) {
      return result.data;
    }
    
    return [];
  } catch (error) {
    console.error('Failed to get session keys from backend:', error);
    return [];
  }
}

/**
 * Delete session key from backend
 */
export async function deleteSessionKeyFromBackend(
  sessionKeyId: string
): Promise<boolean> {
  try {
    const result = await backendAPI.deleteSessionKey(sessionKeyId);
    return result.success;
  } catch (error) {
    console.error('Failed to delete session key from backend:', error);
    return false;
  }
}