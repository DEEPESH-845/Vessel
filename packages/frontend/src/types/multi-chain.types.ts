/**
 * Multi-Chain Types
 * Interfaces for cross-chain operations, routing, and asset aggregation
 */

/**
 * Unified Asset
 * Represents any asset type across chains (tokens, NFTs, DeFi positions)
 */
export interface UnifiedAsset {
  type: 'token' | 'nft' | 'defi-position';
  chain: string;
  chainId: number;
  value: string;
  metadata: TokenMetadata | NFTMetadata | DeFiMetadata;
}

export interface TokenMetadata {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  price: number;
  priceChange24h: number;
  logo?: string;
}

export interface NFTMetadata {
  contractAddress: string;
  tokenId: string;
  name: string;
  description?: string;
  image: string;
  collection: string;
  floorPrice?: number;
}

export interface DeFiMetadata {
  protocol: string;
  type: 'lending' | 'staking' | 'liquidity' | 'farming';
  deposited: string;
  earned: string;
  apy: number;
  claimable?: string;
}

/**
 * Asset Dashboard
 * Aggregated view of all assets across chains
 */
export interface AssetDashboard {
  totalValue: string;
  tokens: UnifiedAsset[];
  nfts: UnifiedAsset[];
  defiPositions: UnifiedAsset[];
  pendingTransactions: import('./transaction.types').PendingTransaction[];
  lastUpdated: Date;
}

/**
 * Chain Route Types
 * For cross-chain transfers and bridges
 */
export interface ChainRoute {
  fromChain: number;
  toChain: number;
  bridges: BridgeStep[];
  estimatedTime: number;
  estimatedCost: string;
  confidence: number;
}

export interface BridgeStep {
  protocol: string;
  fromToken: string;
  toToken: string;
  amount: string;
  estimatedOutput: string;
  fee: string;
}

export interface RouteParams {
  fromChain: number;
  toChain: number;
  token: string;
  amount: string;
  recipient: string;
  priority: 'cost' | 'speed' | 'security';
}

export interface RouteExecution {
  executionId: string;
  steps: ExecutionStep[];
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
}

export interface ExecutionStep {
  stepNumber: number;
  description: string;
  txHash?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  timestamp?: Date;
}

export interface RouteProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: ExecutionStep[];
  estimatedCompletion: number;
}

/**
 * Chain Network Visualization Types
 */
export interface ChainNode {
  chainId: number;
  name: string;
  logo: string;
  position: { x: number; y: number };
  color: string;
}

export interface TransferRoute {
  fromChain: ChainNode;
  toChain: ChainNode;
  intermediateChains?: ChainNode[];
  amount: string;
  token: string;
  status: 'pending' | 'bridging' | 'completed';
}

export interface MapAnimationConfig {
  showParticles: boolean;
  particleColor: string;
  routeColor: string;
  animationSpeed: number;
  glowEffect: boolean;
}

/**
 * Fiat On/Off-Ramp Types
 */
export interface FiatProvider {
  name: string;
  type: 'on-ramp' | 'off-ramp' | 'both';
  supportedCurrencies: string[];
  supportedCryptos: string[];
  limits: FiatLimits;
}

export interface FiatLimits {
  minAmount: number;
  maxAmount: number;
  dailyLimit: number;
  monthlyLimit: number;
}

export interface OnRampRequest {
  fiatAmount: number;
  fiatCurrency: string;
  cryptoCurrency: string;
  destinationAddress: string;
  paymentMethod: 'card' | 'bank' | 'apple-pay' | 'google-pay';
}

export interface OffRampRequest {
  cryptoAmount: string;
  cryptoCurrency: string;
  fiatCurrency: string;
  bankAccount: BankAccountInfo;
}

export interface BankAccountInfo {
  accountNumber: string;
  routingNumber: string;
  accountHolderName: string;
  bankName: string;
}

export interface FiatSession {
  sessionId: string;
  provider: string;
  widgetUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface FiatSessionStatus {
  sessionId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  txHash?: string;
  completedAt?: Date;
  error?: string;
}
