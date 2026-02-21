/**
 * Gas Estimator Service
 * Time-series based gas prediction without SageMaker
 * Uses local algorithm with historical data caching
 * Target: 82% accuracy prediction
 */

export interface GasPrice {
  slow: number; // gwei
  standard: number; // gwei
  fast: number; // gwei
  baseFee: number; // gwei
  priorityFee: number; // gwei
}

export interface GasPrediction {
  current: GasPrice;
  predicted: GasPrice;
  predictionTime: number; // minutes ahead
  confidence: number; // 0-1
  trend: 'rising' | 'falling' | 'stable';
  lastUpdated: string;
}

/**
 * Simple gas prediction using moving average
 * No external API needed - works offline with cached data
 */
export class GasEstimatorService {
  private cache: Map<string, { price: GasPrice; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 15000; // 15 seconds
  private readonly HISTORY_SIZE = 10;
  private priceHistory: GasPrice[] = [];

  /**
   * Get current gas price with prediction
   */
  async getGasPrice(chainId: number = 1): Promise<GasPrediction> {
    // Try to get from cache
    const cached = this.cache.get(`gas-${chainId}`);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return this.predict(cached.price);
    }

    // Fetch from RPC (free)
    const current = await this.fetchGasFromRPC(chainId);
    
    // Update cache
    this.cache.set(`gas-${chainId}`, { price: current, timestamp: Date.now() });
    
    // Add to history for prediction
    this.priceHistory.push(current);
    if (this.priceHistory.length > this.HISTORY_SIZE) {
      this.priceHistory.shift();
    }

    return this.predict(current);
  }

  /**
   * Fetch gas price from RPC (free, no API key needed)
   */
  private async fetchGasFromRPC(chainId: number): Promise<GasPrice> {
    try {
      // Using public RPC endpoints - no API key needed
      const rpcUrls: Record<number, string> = {
        1: 'https://eth.public-rpc.com',
        137: 'https://polygon-rpc.com',
        42161: 'https://arb1.arbitrum.io/rpc',
        8453: 'https://mainnet.base.org',
        1135: 'https://rpc.lisk.com', // Lisk
      };

      const rpcUrl = rpcUrls[chainId] || rpcUrls[1];
      
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_feeHistory',
          params: ['0x5', 'latest', [25, 50, 75]],
          id: 1,
        }),
      });

      const data = await response.json();
      
      if (data.result) {
        const baseFeePerGas = parseInt(data.result.baseFeePerGas[0], 16) / 1e9;
        const priorityFeePerGas = parseInt(data.result.reward[2][0], 16) / 1e9;
        
        return {
          slow: Math.max(baseFeePerGas * 0.8, 1),
          standard: baseFeePerGas + priorityFeePerGas * 0.5,
          fast: baseFeePerGas + priorityFeePerGas,
          baseFee: baseFeePerGas,
          priorityFee: priorityFeePerGas,
        };
      }
    } catch (error) {
      console.error('Failed to fetch gas from RPC:', error);
    }

    // Fallback to default values
    return this.getDefaultGasPrices();
  }

  /**
   * Predict future gas price using moving average
   */
  private predict(current: GasPrice): GasPrediction {
    if (this.priceHistory.length < 3) {
      return {
        current,
        predicted: current,
        predictionTime: 5,
        confidence: 0.5,
        trend: 'stable',
        lastUpdated: new Date().toISOString(),
      };
    }

    // Calculate moving averages
    const recent = this.priceHistory.slice(-3);
    const avgStandard = recent.reduce((sum, p) => sum + p.standard, 0) / recent.length;
    const avgFast = recent.reduce((sum, p) => sum + p.fast, 0) / recent.length;

    // Detect trend
    const first = this.priceHistory[0];
    const last = this.priceHistory[this.priceHistory.length - 1];
    const trend = last.standard > first.standard * 1.1 
      ? 'rising' 
      : last.standard < first.standard * 0.9 
        ? 'falling' 
        : 'stable';

    // Predict based on trend
    let predicted: GasPrice;
    const trendFactor = trend === 'rising' ? 1.15 : trend === 'falling' ? 0.9 : 1;

    predicted = {
      slow: current.slow * trendFactor,
      standard: current.standard * trendFactor,
      fast: current.fast * trendFactor,
      baseFee: current.baseFee * trendFactor,
      priorityFee: current.priorityFee * trendFactor,
    };

    // Confidence based on history length and trend stability
    const confidence = Math.min(0.5 + (this.priceHistory.length / 20) + (trend === 'stable' ? 0.2 : 0), 0.9);

    return {
      current,
      predicted,
      predictionTime: 5, // 5 minutes ahead
      confidence,
      trend,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Get default gas prices for fallback
   */
  private getDefaultGasPrices(): GasPrice {
    return {
      slow: 10,
      standard: 20,
      fast: 40,
      baseFee: 15,
      priorityFee: 5,
    };
  }

  /**
   * Estimate transaction cost
   */
  async estimateTransactionCost(
    chainId: number = 1,
    gasLimit: number = 21000
  ): Promise<{ slow: string; standard: string; fast: string }> {
    const prices = await this.getGasPrice(chainId);

    return {
      slow: (prices.current.slow * gasLimit / 1e9).toFixed(6),
      standard: (prices.current.standard * gasLimit / 1e9).toFixed(6),
      fast: (prices.current.fast * gasLimit / 1e9).toFixed(6),
    };
  }

  /**
   * Proactive budget adjustment based on prediction
   * Returns recommended buffer for paymaster
   */
  async getRecommendedBuffer(chainId: number = 1): Promise<{
    bufferPercent: number;
    reason: string;
  }> {
    const prediction = await this.getGasPrice(chainId);

    if (prediction.trend === 'rising') {
      const increase = (prediction.predicted.standard - prediction.current.standard) / prediction.current.standard;
      if (increase > 0.3) {
        return {
          bufferPercent: 50,
          reason: 'Gas prices predicted to rise significantly',
        };
      }
      return {
        bufferPercent: 25,
        reason: 'Gas prices trending upward',
      };
    }

    return {
      bufferPercent: 15,
      reason: 'Gas prices stable',
    };
  }

  /**
   * Get historical gas data for analytics
   */
  getHistory(): GasPrice[] {
    return [...this.priceHistory];
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.priceHistory = [];
  }
}

// Export singleton instance
export const gasEstimator = new GasEstimatorService();

// Export convenience functions
export async function getGasPrice(chainId?: number): Promise<GasPrediction> {
  return gasEstimator.getGasPrice(chainId);
}

export async function estimateTxCost(chainId?: number, gasLimit?: number): Promise<{ slow: string; standard: string; fast: string }> {
  return gasEstimator.estimateTransactionCost(chainId, gasLimit);
}
