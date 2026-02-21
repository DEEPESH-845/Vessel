/**
 * Wallet Types
 * Extended wallet interfaces including session keys and recovery
 */

import { RecoveryConfig, CreatedWallet } from './wallet-creation.types';

export type { RecoveryConfig, CreatedWallet };

/**
 * Session Key
 * Temporary signing key for limited-scope transactions
 */
export interface SessionKey {
  publicKey: string;
  privateKey: string;
  permissions: SessionPermissions;
  expiresAt: number;
  createdAt: number;
}

export interface SessionPermissions {
  allowedContracts?: string[];
  allowedFunctions?: string[];
  spendingLimit?: string;
  timeLimit?: number;
  chainIds?: number[];
}

/**
 * Meta-Transaction Types
 */
export interface MetaTransaction {
  from: string;
  to: string;
  value: string;
  data: string;
  nonce: number;
  chainId: number;
  signature: string;
}

export interface RelayerConfig {
  endpoint: string;
  apiKey: string;
  supportedChains: number[];
  maxGasPrice: string;
}

export interface RelayerStatus {
  status: 'pending' | 'submitted' | 'confirmed' | 'failed';
  txHash?: string;
  blockNumber?: number;
  gasUsed?: string;
}

/**
 * Gas Payment Types
 */
export interface GasPaymentConfig {
  paymentToken: string;
  paymasterAddress: string;
  exchangeRate: string;
  maxSlippage: number;
}

export interface GasEstimate {
  gasLimit: string;
  gasPrice: string;
  nativeTokenCost: string;
  stablecoinCost: string;
  exchangeRate: string;
}

/**
 * ENS and Name Service Types
 */
export interface ENSProfile {
  name: string;
  address: string;
  avatar?: string;
  description?: string;
  twitter?: string;
  github?: string;
  email?: string;
}

/**
 * Contact Types
 */
export interface Contact {
  id: string;
  address: string;
  name: string;
  avatar?: string;
  ensName?: string;
  tags?: string[];
  notes?: string;
  addedAt: Date;
  lastUsed?: Date;
}

export interface ContactFilter {
  tags?: string[];
  sortBy?: 'name' | 'lastUsed' | 'addedAt';
  limit?: number;
}
