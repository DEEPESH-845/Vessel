/**
 * AI Assistant Types
 * Natural language interface for transaction intents and wallet operations
 */

import { UnifiedAsset } from './multi-chain.types';
import { EnhancedTransaction } from './transaction.types';

/**
 * Transaction Intent
 * Parsed intent from natural language input
 */
export interface TransactionIntent {
  type: 'send' | 'swap' | 'bridge' | 'stake' | 'unknown';
  confidence: number;
  parameters: IntentParameters;
  clarificationNeeded?: string[];
}

export interface IntentParameters {
  recipient?: string;
  amount?: string;
  token?: string;
  fromChain?: number;
  toChain?: number;
  protocol?: string;
}

/**
 * Action Suggestion
 * Proactive suggestions from AI assistant
 */
export interface ActionSuggestion {
  title: string;
  description: string;
  action: () => Promise<void>;
  priority: number;
  category: 'optimization' | 'security' | 'opportunity';
  estimatedSavings?: string;
  riskLevel?: 'low' | 'medium' | 'high';
}

/**
 * Wallet Context
 * Context provided to AI for personalized assistance
 */
export interface WalletContext {
  address: string;
  balances: UnifiedAsset[];
  recentTransactions: EnhancedTransaction[];
  activeChains: number[];
  preferences?: {
    riskTolerance?: 'low' | 'medium' | 'high';
    preferredTokens?: string[];
    gasPreference?: 'slow' | 'standard' | 'fast';
  };
}

/**
 * AI Chat Types
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  intent?: TransactionIntent;
  suggestions?: ActionSuggestion[];
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  context: WalletContext;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Transaction Explanation
 */
export interface TransactionExplanation {
  summary: string;
  details: string[];
  risks: string[];
  expectedOutcome: string;
  estimatedCost: string;
  confidence: number;
}

/**
 * Address Identity Types
 */
export interface AddressIdentity {
  address: string;
  ensName?: string;
  avatar?: string;
  labels: string[];
  reputation?: ReputationScore;
  socialProfiles?: SocialProfile[];
  firstSeen?: Date;
  transactionCount?: number;
  isContract?: boolean;
  contractType?: string;
}

export interface ReputationScore {
  score: number;
  level: 'new' | 'active' | 'trusted' | 'verified';
  badges: string[];
  verifications: Verification[];
}

export interface Verification {
  type: 'twitter' | 'github' | 'discord' | 'kyc';
  verified: boolean;
  verifiedAt?: Date;
}

export interface SocialProfile {
  platform: string;
  username: string;
  url: string;
}

export interface RiskIndicator {
  level: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[];
  recommendations: string[];
}
