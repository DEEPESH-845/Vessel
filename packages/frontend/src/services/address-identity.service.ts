/**
 * Address Identity Service
 * Fetches identity, reputation, and verification data for addresses
 * Requirements: FR-16.1, FR-16.2, FR-16.3, FR-16.4
 */

import { ethers } from 'ethers';
import { ensResolverService } from './ens-resolver.service';

/**
 * Address Identity
 */
export interface AddressIdentity {
  address: string;
  ensName: string | null;
  avatar: string | null;
  labels: string[];
  isContract: boolean;
  contractName?: string;
  verified: boolean;
  socialVerifications: {
    twitter?: string;
    github?: string;
    telegram?: string;
    discord?: string;
  };
}

/**
 * Reputation Score
 */
export interface ReputationScore {
  score: number; // 0-100
  level: 'new' | 'active' | 'trusted' | 'verified';
  factors: {
    accountAge: number; // days
    transactionCount: number;
    totalVolume: string;
    socialVerified: boolean;
  };
}

/**
 * Risk Assessment
 */
export interface RiskAssessment {
  level: 'low' | 'medium' | 'high';
  warnings: string[];
  flags: string[];
}

/**
 * Address Identity Service
 * Provides identity, reputation, and risk data for addresses
 */
export class AddressIdentityService {
  private static instance: AddressIdentityService;
  
  private cache = new Map<string, { data: AddressIdentity; timestamp: number }>();
  private reputationCache = new Map<string, { data: ReputationScore; timestamp: number }>();
  private readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes

  private constructor() {}

  static getInstance(): AddressIdentityService {
    if (!AddressIdentityService.instance) {
      AddressIdentityService.instance = new AddressIdentityService();
    }
    return AddressIdentityService.instance;
  }

  /**
   * Get identity for an address
   */
  async getIdentity(address: string, chainId: number = 1): Promise<AddressIdentity> {
    // Check cache
    const cached = this.cache.get(address);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const normalizedAddress = ethers.getAddress(address);

    // Get ENS profile
    let ensName: string | null = null;
    let avatar: string | null = null;
    let socialVerifications: AddressIdentity['socialVerifications'] = {};

    try {
      const profile = await ensResolverService.resolveProfile(normalizedAddress, chainId);
      ensName = profile.name;
      avatar = profile.avatar;
      socialVerifications = {
        twitter: profile.twitter || undefined,
        github: profile.github || undefined,
      };
    } catch (error) {
      console.error('ENS resolution failed:', error);
    }

    // Check if contract
    const isContract = await this.checkIsContract(normalizedAddress, chainId);
    let contractName: string | undefined;
    if (isContract) {
      contractName = await this.getContractName(normalizedAddress, chainId);
    }

    // Get labels from blocklist/trusted sources
    const labels = await this.getAddressLabels(normalizedAddress);

    // Check verification status
    const verified = Object.values(socialVerifications).some((v) => !!v);

    const identity: AddressIdentity = {
      address: normalizedAddress,
      ensName,
      avatar,
      labels,
      isContract,
      contractName,
      verified,
      socialVerifications,
    };

    // Cache result
    this.cache.set(normalizedAddress, { data: identity, timestamp: Date.now() });

    return identity;
  }

  /**
   * Check if address is a contract
   */
  private async checkIsContract(address: string, chainId: number): Promise<boolean> {
    try {
      const urls: Record<number, string> = {
        1: process.env.NEXT_PUBLIC_ETHEREUM_RPC || 'https://eth.llamarpc.com',
        137: process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://polygon.llamarpc.com',
        42161: process.env.NEXT_PUBLIC_ARBITRUM_RPC || 'https://arbitrum.llamarpc.com',
        8453: process.env.NEXT_PUBLIC_BASE_RPC || 'https://base.llamarpc.com',
      };
      
      const provider = new ethers.JsonRpcProvider(urls[chainId] || urls[1]);
      const code = await provider.getCode(address);
      return code !== '0x';
    } catch {
      return false;
    }
  }

  /**
   * Get contract name from etherscan
   */
  private async getContractName(address: string, chainId: number): Promise<string | undefined> {
    // In production, would call Etherscan API
    return undefined;
  }

  /**
   * Get address labels from various sources
   */
  private async getAddressLabels(address: string): Promise<string[]> {
    const labels: string[] = [];

    // Known addresses (mock data - would use actual blocklist/trusted list)
    const knownLabels: Record<string, string[]> = {
      '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': ['Uniswap Router', 'DEX'],
      '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45': ['Uniswap V3 Router', 'DEX'],
      '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f': ['SushiSwap Router', 'DEX'],
      '0x1111111254eeb25477b68fb85ed929f73a960582': ['1inch Router', 'DEX Aggregator'],
    };

    const lowerAddress = address.toLowerCase();
    if (knownLabels[lowerAddress]) {
      labels.push(...knownLabels[lowerAddress]);
    }

    return labels;
  }

  /**
   * Calculate reputation score
   */
  async getReputation(address: string, chainId: number = 1): Promise<ReputationScore> {
    // Check cache
    const cached = this.reputationCache.get(address);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    // In production, would:
    // 1. Query blockchain for transaction history
    // 2. Calculate account age
    // 3. Sum total volume
    // 4. Check social verifications

    // Mock data for demonstration
    const score: ReputationScore = {
      score: 50,
      level: 'active',
      factors: {
        accountAge: 365,
        transactionCount: 100,
        totalVolume: '10.0',
        socialVerified: false,
      },
    };

    // Get identity for social verification
    const identity = await this.getIdentity(address, chainId);
    score.factors.socialVerified = identity.verified;

    // Calculate score based on factors
    score.score = this.calculateReputationScore(score.factors);

    // Determine level
    score.level = this.determineReputationLevel(score.score);

    // Cache result
    this.reputationCache.set(address, { data: score, timestamp: Date.now() });

    return score;
  }

  /**
   * Calculate reputation score from factors
   */
  private calculateReputationScore(factors: ReputationScore['factors']): number {
    let score = 0;

    // Account age factor (max 25 points)
    const ageScore = Math.min(25, factors.accountAge / 14.6); // 1 year = 25 points
    score += ageScore;

    // Transaction count factor (max 25 points)
    const txScore = Math.min(25, factors.transactionCount / 4);
    score += txScore;

    // Volume factor (max 25 points)
    const volume = parseFloat(factors.totalVolume);
    const volumeScore = Math.min(25, volume * 2.5);
    score += volumeScore;

    // Social verification (25 points)
    if (factors.socialVerified) {
      score += 25;
    }

    return Math.round(score);
  }

  /**
   * Determine reputation level from score
   */
  private determineReputationLevel(score: number): ReputationScore['level'] {
    if (score >= 80) return 'verified';
    if (score >= 60) return 'trusted';
    if (score >= 30) return 'active';
    return 'new';
  }

  /**
   * Assess risk for an address
   */
  async assessRisk(address: string): Promise<RiskAssessment> {
    const warnings: string[] = [];
    const flags: string[] = [];

    // Check if address is very new (in production, would check creation date)
    // For now, use placeholder logic

    // Check against known blacklists
    const isBlacklisted = await this.checkBlacklist(address);
    if (isBlacklisted) {
      flags.push('Address appears on security blacklist');
    }

    // Determine risk level
    let level: RiskAssessment['level'] = 'low';
    if (flags.length > 0) {
      level = 'high';
    } else if (warnings.length > 0) {
      level = 'medium';
    }

    return { level, warnings, flags };
  }

  /**
   * Check if address is on blacklist
   */
  private async checkBlacklist(address: string): Promise<boolean> {
    // In production, would check against OFAC, Chainalysis, etc.
    return false;
  }

  /**
   * Get combined identity card data
   */
  async getIdentityCard(address: string, chainId: number = 1): Promise<{
    identity: AddressIdentity;
    reputation: ReputationScore;
    risk: RiskAssessment;
  }> {
    const [identity, reputation, risk] = await Promise.all([
      this.getIdentity(address, chainId),
      this.getReputation(address, chainId),
      this.assessRisk(address),
    ]);

    return { identity, reputation, risk };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.reputationCache.clear();
  }
}

// Export singleton instance
export const addressIdentityService = AddressIdentityService.getInstance();