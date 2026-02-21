/**
 * Gas Estimator Service
 * Fetches gas prices and estimates confirmation times
 * Requirements: FR-15.1, FR-15.2, FR-15.3
 */

import { ethers } from 'ethers';

/**
 * Gas Price Levels
 */
export type GasLevel = 'slow' | 'standard' | 'fast' | 'instant';

/**
 * Gas Price Estimate
 */
export interface GasPriceEstimate {
  level: GasLevel;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  gasPrice: bigint;
  estimatedConfirmationTime: number; // seconds
  confidence: number; // 0-100
}

/**
 * Full Gas Estimate with cost calculation
 */
export interface FullGasEstimate {
  chainId: number;
  chainName: string;
  nativeToken: string;
  nativeTokenPrice: number;
  estimates: GasPriceEstimate[];
  baseFee: bigint;
  recommended: GasLevel;
  networkCongestion: 'low' | 'medium' | 'high';
  lastUpdated: Date;
}

/**
 * Gas Estimator Service
 * Provides gas price estimates with confirmation times
 */
export class GasEstimatorService {
  private static instance: GasEstimatorService;
  
  private providers = new Map<number, ethers.JsonRpcProvider>();
  private cache = new Map<number, { data: FullGasEstimate; timestamp: number }>();
  private readonly CACHE_TTL = 15000; // 15 seconds

  private constructor() {}

  static getInstance(): GasEstimatorService {
    if (!GasEstimatorService.instance) {
      GasEstimatorService.instance = new GasEstimatorService();
    }
    return GasEstimatorService.instance;
  }

  /**
   * Get provider for chain
   */
  private getProvider(chainId: number): ethers.JsonRpcProvider {
    if (!this.providers.has(chainId)) {
      const urls: Record<number, string> = {
        1: process.env.NEXT_PUBLIC_ETHEREUM_RPC || 'https://eth.llamarpc.com',
        137: process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://polygon.llamarpc.com',
        42161: process.env.NEXT_PUBLIC_ARBITRUM_RPC || 'https://arbitrum.llamarpc.com',
        8453: process.env.NEXT_PUBLIC_BASE_RPC || 'https://base.llamarpc.com',
      };
      this.providers.set(chainId, new ethers.JsonRpcProvider(urls[chainId] || urls[1]));
    }
    return this.providers.get(chainId)!;
  }

  /**
   * Get chain info
   */
  private getChainInfo(chainId: number): { name: string; nativeToken: string } {
    const info: Record<number, { name: string; nativeToken: string }> = {
      1: { name: 'Ethereum', nativeToken: 'ETH' },
      137: { name: 'Polygon', nativeToken: 'MATIC' },
      42161: { name: 'Arbitrum', nativeToken: 'ETH' },
      8453: { name: 'Base', nativeToken: 'ETH' },
    };
    return info[chainId] || { name: 'Unknown', nativeToken: 'ETH' };
  }

  /**
   * Get native token price (mock - should use price oracle)
   */
  private async getNativeTokenPrice(chainId: number): Promise<number> {
    // Mock prices - integrate with CoinGecko or similar
    const prices: Record<number, number> = {
      1: 2500, // ETH
      137: 0.8, // MATIC
      42161: 2500, // ETH
      8453: 2500, // ETH
    };
    return prices[chainId] || 0;
  }

  /**
   * Get gas estimates for a chain
   */
  async getGasEstimates(chainId: number): Promise<FullGasEstimate> {
    // Check cache
    const cached = this.cache.get(chainId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const provider = this.getProvider(chainId);
    const chainInfo = this.getChainInfo(chainId);
    const nativeTokenPrice = await this.getNativeTokenPrice(chainId);

    // Get fee data
    const feeData = await provider.getFeeData();
    const baseFee = feeData.gasPrice || 0n;

    // Calculate gas levels
    const estimates = this.calculateGasLevels(baseFee, chainId);

    // Determine recommended level
    const recommended = this.recommendGasLevel(estimates);

    // Calculate network congestion
    const networkCongestion = this.calculateCongestion(baseFee);

    const result: FullGasEstimate = {
      chainId,
      chainName: chainInfo.name,
      nativeToken: chainInfo.nativeToken,
      nativeTokenPrice,
      estimates,
      baseFee,
      recommended,
      networkCongestion,
      lastUpdated: new Date(),
    };

    // Cache result
    this.cache.set(chainId, { data: result, timestamp: Date.now() });

    return result;
  }

  /**
   * Calculate gas levels from base fee
   */
  private calculateGasLevels(baseFee: bigint, chainId: number): GasPriceEstimate[] {
    // Different multipliers for different chains
    const multipliers: Record<number, Record<GasLevel, { fee: number; priority: number; time: number }>> = {
      1: { // Ethereum mainnet
        slow: { fee: 1.0, priority: 0.5, time: 300 },
        standard: { fee: 1.2, priority: 1.0, time: 60 },
        fast: { fee: 1.5, priority: 1.5, time: 30 },
        instant: { fee: 2.0, priority: 2.0, time: 15 },
      },
      137: { // Polygon
        slow: { fee: 1.0, priority: 1.0, time: 60 },
        standard: { fee: 1.1, priority: 1.5, time: 30 },
        fast: { fee: 1.3, priority: 2.0, time: 15 },
        instant: { fee: 1.5, priority: 3.0, time: 5 },
      },
      42161: { // Arbitrum
        slow: { fee: 1.0, priority: 0.1, time: 60 },
        standard: { fee: 1.0, priority: 0.2, time: 30 },
        fast: { fee: 1.0, priority: 0.3, time: 15 },
        instant: { fee: 1.0, priority: 0.5, time: 5 },
      },
      8453: { // Base
        slow: { fee: 1.0, priority: 0.1, time: 60 },
        standard: { fee: 1.0, priority: 0.2, time: 30 },
        fast: { fee: 1.0, priority: 0.3, time: 15 },
        instant: { fee: 1.0, priority: 0.5, time: 5 },
      },
    };

    const chainMultipliers = multipliers[chainId] || multipliers[1];

    const levels: GasLevel[] = ['slow', 'standard', 'fast', 'instant'];

    return levels.map((level) => {
      const mult = chainMultipliers[level];
      const priorityFee = (baseFee * BigInt(Math.floor(mult.priority * 100))) / 100n;
      const maxFee = baseFee + priorityFee;

      return {
        level,
        maxFeePerGas: maxFee,
        maxPriorityFeePerGas: priorityFee,
        gasPrice: maxFee,
        estimatedConfirmationTime: mult.time,
        confidence: this.calculateConfidence(level),
      };
    });
  }

  /**
   * Calculate confidence level for gas estimate
   */
  private calculateConfidence(level: GasLevel): number {
    const confidences: Record<GasLevel, number> = {
      slow: 95,
      standard: 85,
      fast: 75,
      instant: 60,
    };
    return confidences[level];
  }

  /**
   * Recommend optimal gas level
   */
  private recommendGasLevel(estimates: GasPriceEstimate[]): GasLevel {
    // Default to standard
    return 'standard';
  }

  /**
   * Calculate network congestion level
   */
  private calculateCongestion(baseFee: bigint): 'low' | 'medium' | 'high' {
    // These thresholds would be chain-specific in production
    const gwei = Number(ethers.formatUnits(baseFee, 'gwei'));

    if (gwei < 20) return 'low';
    if (gwei < 50) return 'medium';
    return 'high';
  }

  /**
   * Calculate transaction cost
   */
  calculateCost(
    gasEstimate: GasPriceEstimate,
    gasLimit: bigint,
    nativeTokenPrice: number
  ): {
    gasCost: string;
    gasCostWei: bigint;
    usdCost: string;
  } {
    const gasCostWei = gasEstimate.maxFeePerGas * gasLimit;
    const gasCost = ethers.formatEther(gasCostWei);
    const usdCost = (parseFloat(gasCost) * nativeTokenPrice).toFixed(2);

    return {
      gasCost,
      gasCostWei,
      usdCost,
    };
  }

  /**
   * Get gas estimate for a specific level
   */
  async getGasEstimateForLevel(
    chainId: number,
    level: GasLevel
  ): Promise<GasPriceEstimate> {
    const estimates = await this.getGasEstimates(chainId);
    return estimates.estimates.find((e) => e.level === level) || estimates.estimates[1];
  }

  /**
   * Calculate cost difference between levels
   */
  calculateCostDifference(
    base: GasPriceEstimate,
    compare: GasPriceEstimate,
    gasLimit: bigint
  ): {
    gasDifference: string;
    percentChange: number;
  } {
    const baseCost = base.maxFeePerGas * gasLimit;
    const compareCost = compare.maxFeePerGas * gasLimit;
    const difference = compareCost - baseCost;

    return {
      gasDifference: ethers.formatEther(difference),
      percentChange: Number((difference * 100n) / baseCost),
    };
  }

  /**
   * Check if gas price is unusually high
   */
  isGasPriceHigh(chainId: number, gasPrice: bigint): boolean {
    const gwei = Number(ethers.formatUnits(gasPrice, 'gwei'));
    const thresholds: Record<number, number> = {
      1: 100, // 100 gwei for Ethereum
      137: 5, // 5 gwei for Polygon
      42161: 2, // 2 gwei for Arbitrum
      8453: 2, // 2 gwei for Base
    };
    return gwei > (thresholds[chainId] || 100);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const gasEstimatorService = GasEstimatorService.getInstance();