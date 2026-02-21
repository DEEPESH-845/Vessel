/**
 * Authentication Types
 * Defines interfaces for social authentication and user profiles
 */

import { RecoveryConfig } from './wallet-creation.types';

export interface SocialAuthProvider {
  type: 'email' | 'google' | 'apple';
  authenticate(): Promise<AuthResult>;
  getIdToken(): Promise<string>;
}

export interface AuthResult {
  userId: string;
  email: string;
  provider: string;
  idToken: string;
  expiresAt: number;
}

export interface UserProfile {
  id: string;
  email?: string;
  socialProvider?: 'google' | 'apple' | 'email';
  walletAddress?: string;
  walletType?: 'eoa' | 'smart-contract' | 'mpc';
  recoveryConfig?: RecoveryConfig;
  createdAt: Date;
  lastLoginAt: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  defaultChain: number;
  defaultToken: string;
  gasPreference: 'slow' | 'standard' | 'fast';
  enableNotifications: boolean;
  enableHaptics: boolean;
  theme: 'dark' | 'light';
  currency: 'USD' | 'EUR' | 'GBP';
}

export interface SessionData {
  user: UserProfile;
  accessToken: string;
  expiresAt: number;
}

/**
 * Recovery Request
 * Used for initiating wallet recovery
 */
export interface RecoveryRequest {
  walletAddress: string;
  userId: string;
  method: 'mpc' | 'social-recovery';
  proof: RecoveryProof;
}

export interface RecoveryProof {
  socialIdToken?: string;
  guardianSignatures?: string[];
  timelockExpiry?: number;
}

export interface RecoverySession {
  sessionId: string;
  status: 'pending' | 'verifying' | 'executing' | 'completed' | 'failed';
  createdAt: Date;
  expiresAt: Date;
}
