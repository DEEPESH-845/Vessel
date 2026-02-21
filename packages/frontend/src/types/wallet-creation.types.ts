/**
 * Wallet Creation Types
 * Defines interfaces for wallet creation with MPC and smart contract support
 */

export interface WalletCreationConfig {
  userId: string;
  provider: 'mpc' | 'smart-contract';
  recoveryMethod: 'social' | 'guardian' | 'timelock';
  initialChains: number[];
}

export interface CreatedWallet {
  address: string;
  type: 'eoa' | 'smart-contract';
  deploymentTxHash?: string;
  recoveryConfig: RecoveryConfig;
  createdAt: Date;
}

export interface RecoveryConfig {
  method: 'mpc' | 'social-recovery' | 'timelock';
  threshold?: number;
  guardians?: string[];
  timelockPeriod?: number;
  keyShares?: KeyShareMetadata[];
}

export interface KeyShareMetadata {
  shareId: string;
  provider: string;
  encryptedShare: string;
  createdAt: Date;
}

export type WalletCreationStep = 
  | 'selecting-type'
  | 'generating-address'
  | 'distributing-keys'
  | 'preparing-deployment'
  | 'completed';

export interface WalletCreationProgress {
  currentStep: WalletCreationStep;
  progress: number; // 0-100
  message: string;
}
