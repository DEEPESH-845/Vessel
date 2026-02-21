/**
 * Transaction Types
 * Enhanced transaction interfaces with metadata and status tracking
 */

/**
 * Enhanced Transaction
 * Extended transaction with chain info, metadata, and status
 */
export interface EnhancedTransaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  token?: string;
  chainId: number;
  blockNumber?: number;
  timestamp: Date;
  status: 'pending' | 'confirming' | 'completed' | 'failed';
  type: 'send' | 'receive' | 'swap' | 'bridge' | 'contract';
  gasUsed?: string;
  gasPaidIn?: string;
  gasCostUSD?: string;
  metadata: TransactionMetadata;
}

export interface TransactionMetadata {
  isMetaTx: boolean;
  usedSessionKey: boolean;
  paymasterAddress?: string;
  bridgeProtocol?: string;
  swapProtocol?: string;
  nftTransfer?: NFTTransferInfo;
  contractInteraction?: ContractInteractionInfo;
}

export interface NFTTransferInfo {
  contractAddress: string;
  tokenId: string;
  name: string;
  image: string;
}

export interface ContractInteractionInfo {
  contractAddress: string;
  functionName: string;
  parameters: any[];
}

/**
 * Transaction Timeline Types
 */
export interface TransactionTimeline {
  txHash: string;
  stages: TimelineStage[];
  currentStage: number;
  estimatedCompletion: number;
}

export interface TimelineStage {
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  timestamp?: Date;
  description: string;
  icon: string;
  metadata?: Record<string, any>;
}

export interface TimelineAnimationConfig {
  duration: number;
  easing: string;
  particleEffect: boolean;
  soundEnabled: boolean;
}

/**
 * Gas Estimator Types
 */
export interface GasEstimatorConfig {
  minGasPrice: string;
  maxGasPrice: string;
  currentGasPrice: string;
  baseFee?: string;
  priorityFee?: string;
}

export interface GasOption {
  label: 'slow' | 'standard' | 'fast' | 'instant';
  gasPrice: string;
  estimatedTime: number;
  cost: string;
  probability: number;
}

/**
 * Activity Page Types
 */
export interface ActivityFilter {
  chains?: string[];
  tokens?: string[];
  status?: ('pending' | 'confirming' | 'completed' | 'failed')[];
  dateRange?: { start: Date; end: Date };
  minAmount?: number;
  maxAmount?: number;
}

export interface ActivityTransaction extends EnhancedTransaction {
  chain: string;
}

/**
 * Pending Transaction Types
 */
export interface PendingTransaction {
  hash: string;
  type: 'send' | 'receive' | 'swap' | 'bridge' | 'contract';
  status: 'pending' | 'confirming';
  from: string;
  to: string;
  value: string;
  token: string;
  chainId: number;
  submittedAt: Date;
  estimatedConfirmation?: Date;
  confirmations?: number;
  requiredConfirmations?: number;
  cancellable?: boolean;
  // Legacy fields for backward compatibility
  chain?: number;
}
