/**
 * Paymaster Service
 * Handles ERC-4337 paymaster integration for gas abstraction
 * Requirements: FR-5.1, FR-5.2, FR-5.3
 * 
 * Updated to use AWS Lambda backend for secure signing
 */

import { ethers } from 'ethers';
import { backendAPI } from '@/lib/backend-client';

/**
 * Gas Estimate Types
 */
export interface GasEstimate {
  gasLimit: bigint;
  gasPrice: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  nativeTokenCost: string;
  stablecoinCost: string;
  exchangeRate: string;
  paymasterFee: string;
  totalCost: string;
}

/**
 * Paymaster Configuration
 */
export interface PaymasterConfig {
  address: string;
  stableToken: string; // USDC/USDT address
  exchangeRate: string; // Token per native token
  feeBps: number; // Fee in basis points
  minAmount: string;
  maxAmount: string;
}

/**
 * UserOperation for ERC-4337
 */
export interface UserOperation {
  sender: string;
  nonce: string;
  initCode: string;
  callData: string;
  callGasLimit: string;
  verificationGasLimit: string;
  preVerificationGas: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  paymasterAndData: string;
  signature: string;
}

/**
 * Paymaster Service
 * Enables paying gas fees in stablecoins instead of native tokens
 */
export class PaymasterService {
  private static instance: PaymasterService;
  
  private paymasters = new Map<number, PaymasterConfig>();
  private providers = new Map<number, ethers.JsonRpcProvider>();

  private constructor() {}

  static getInstance(): PaymasterService {
    if (!PaymasterService.instance) {
      PaymasterService.instance = new PaymasterService();
    }
    return PaymasterService.instance;
  }

  /**
   * Configure paymaster for a chain
   */
  configurePaymaster(chainId: number, config: PaymasterConfig): void {
    this.paymasters.set(chainId, config);
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
   * Get gas estimate for a transaction
   */
  async estimateGas(
    tx: {
      from: string;
      to: string;
      value: string;
      data: string;
    },
    chainId: number
  ): Promise<GasEstimate> {
    const provider = this.getProvider(chainId);
    const paymaster = this.paymasters.get(chainId);

    // Get fee data
    const feeData = await provider.getFeeData();
    const maxFeePerGas = feeData.maxFeePerGas || feeData.gasPrice || 0n;
    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || maxFeePerGas / 2n;

    // Estimate gas limit
    const gasLimit = await provider.estimateGas({
      from: tx.from,
      to: tx.to,
      value: tx.value,
      data: tx.data,
    });

    // Add buffer for paymaster overhead
    const totalGasLimit = gasLimit + 50000n; // Paymaster verification overhead

    // Calculate native token cost
    const nativeCost = totalGasLimit * maxFeePerGas;
    const nativeCostFormatted = ethers.formatEther(nativeCost);

    // Calculate stablecoin cost
    let stablecoinCost = '0';
    let exchangeRate = '0';
    let paymasterFee = '0';
    let totalCost = nativeCostFormatted;

    if (paymaster) {
      exchangeRate = paymaster.exchangeRate;
      
      // Stablecoin cost = native cost * exchange rate
      const stableAmount = nativeCost * BigInt(Math.floor(parseFloat(exchangeRate) * 1e6)) / 1000000n;
      stablecoinCost = ethers.formatUnits(stableAmount, 6); // Assuming 6 decimals for stablecoin

      // Paymaster fee (in stablecoin)
      const feeAmount = (stableAmount * BigInt(paymaster.feeBps)) / 10000n;
      paymasterFee = ethers.formatUnits(feeAmount, 6);

      // Total stablecoin cost
      const totalStable = stableAmount + feeAmount;
      totalCost = ethers.formatUnits(totalStable, 6);
    }

    return {
      gasLimit: totalGasLimit,
      gasPrice: maxFeePerGas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nativeTokenCost: nativeCostFormatted,
      stablecoinCost,
      exchangeRate,
      paymasterFee,
      totalCost,
    };
  }

  /**
   * Build UserOperation with paymaster
   */
  async buildUserOperation(
    tx: {
      from: string;
      to: string;
      value: string;
      data: string;
    },
    chainId: number,
    options?: {
      usePaymaster?: boolean;
      validUntil?: number;
      validAfter?: number;
    }
  ): Promise<Partial<UserOperation>> {
    const provider = this.getProvider(chainId);
    const paymaster = this.paymasters.get(chainId);
    
    // Get nonce (simplified - in production, use EntryPoint contract)
    const nonce = await provider.getTransactionCount(tx.from);

    // Get gas estimate
    const gasEstimate = await this.estimateGas(tx, chainId);

    // Build paymasterAndData
    let paymasterAndData = '0x';
    
    if (options?.usePaymaster && paymaster) {
      const validUntil = options.validUntil || Math.floor(Date.now() / 1000) + 3600; // 1 hour
      const validAfter = options.validAfter || Math.floor(Date.now() / 1000);

      // Paymaster address (20 bytes) + validUntil (6 bytes) + validAfter (6 bytes)
      // Signature will be added by the paymaster
      paymasterAndData = ethers.solidityPacked(
        ['address', 'uint48', 'uint48'],
        [paymaster.address, validUntil, validAfter]
      );
    }

    return {
      sender: tx.from,
      nonce: ethers.toBeHex(nonce),
      initCode: '0x', // For already deployed accounts
      callData: this.encodeExecuteCall(tx.to, tx.value, tx.data),
      callGasLimit: ethers.toBeHex(gasEstimate.gasLimit),
      verificationGasLimit: ethers.toBeHex(100000n), // Fixed for now
      preVerificationGas: ethers.toBeHex(50000n), // Fixed for now
      maxFeePerGas: ethers.toBeHex(gasEstimate.maxFeePerGas),
      maxPriorityFeePerGas: ethers.toBeHex(gasEstimate.maxPriorityFeePerGas),
      paymasterAndData,
      signature: '0x', // To be signed
    };
  }

  /**
   * Encode execute call for smart account
   */
  private encodeExecuteCall(to: string, value: string, data: string): string {
    // Simple execute encoding - actual implementation depends on account contract
    const iface = new ethers.Interface([
      'function execute(address to, uint256 value, bytes data)',
    ]);
    return iface.encodeFunctionData('execute', [to, value, data]);
  }

  /**
   * Request paymaster signature from backend
   * Uses AWS Lambda + KMS for secure signing
   */
  async requestPaymasterSignature(
    userOpHash: string,
    chainId: number,
    sender: string,
    maxCost?: bigint
  ): Promise<string> {
    // Get paymaster address from backend config
    const configResult = await backendAPI.getPaymasterConfig();
    if (!configResult.success || !configResult.data) {
      throw new Error('Failed to get paymaster configuration');
    }

    const paymasterAddress = configResult.data.addresses[chainId];
    if (!paymasterAddress) {
      throw new Error(`No paymaster configured for chain ${chainId}`);
    }

    const validUntil = Math.floor(Date.now() / 1000) + 3600; // 1 hour
    const validAfter = Math.floor(Date.now() / 1000);

    // Request signature from AWS Lambda backend
    const result = await backendAPI.signPaymasterData(
      userOpHash,
      validUntil,
      validAfter,
      paymasterAddress
    );

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to get paymaster signature');
    }

    return result.data.paymasterAndData;
  }

  /**
   * Validate UserOperation for sponsorship
   */
  async validateForSponsorship(
    userOpHash: string,
    sender: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    const result = await backendAPI.validateUserOpForSponsorship(userOpHash, sender);
    
    if (!result.success) {
      return { allowed: false, reason: result.error };
    }
    
    return result.data || { allowed: false, reason: 'Unknown error' };
  }

  /**
   * Get backend paymaster configuration
   */
  async fetchPaymasterConfigFromBackend(): Promise<void> {
    const result = await backendAPI.getPaymasterConfig();
    
    if (result.success && result.data) {
      // Configure paymasters for each supported chain
      for (const chainId of result.data.supportedChains || []) {
        const address = result.data.addresses?.[chainId];
        if (address && address !== ethers.ZeroAddress) {
          this.configurePaymaster(chainId, {
            address,
            stableToken: '', // Would come from config
            exchangeRate: '1', // Default rate
            feeBps: 30, // 0.3%
            minAmount: '0',
            maxAmount: '1000000',
          });
        }
      }
    }
  }

  /**
   * Check if paymaster is available for chain
   */
  isPaymasterAvailable(chainId: number): boolean {
    return this.paymasters.has(chainId);
  }

  /**
   * Get paymaster configuration
   */
  getPaymasterConfig(chainId: number): PaymasterConfig | undefined {
    return this.paymasters.get(chainId);
  }

  /**
   * Approve stablecoin for paymaster spending
   */
  async approveStablecoin(
    amount: string,
    chainId: number,
    signer: ethers.Signer
  ): Promise<string> {
    const paymaster = this.paymasters.get(chainId);
    if (!paymaster) {
      throw new Error('No paymaster configured for this chain');
    }

    const tokenContract = new ethers.Contract(
      paymaster.stableToken,
      [
        'function approve(address spender, uint256 amount) returns (bool)',
        'function allowance(address owner, address spender) view returns (uint256)',
      ],
      signer
    );

    const amountWei = ethers.parseUnits(amount, 6);
    const tx = await tokenContract.approve(paymaster.address, amountWei);
    return tx.hash;
  }

  /**
   * Check stablecoin allowance
   */
  async checkAllowance(
    owner: string,
    chainId: number,
    provider: ethers.JsonRpcProvider
  ): Promise<string> {
    const paymaster = this.paymasters.get(chainId);
    if (!paymaster) {
      return '0';
    }

    const tokenContract = new ethers.Contract(
      paymaster.stableToken,
      ['function allowance(address owner, address spender) view returns (uint256)'],
      provider
    );

    const allowance = await tokenContract.allowance(owner, paymaster.address);
    return ethers.formatUnits(allowance, 6);
  }

  /**
   * Get stablecoin balance
   */
  async getStablecoinBalance(
    address: string,
    chainId: number,
    provider: ethers.JsonRpcProvider
  ): Promise<string> {
    const paymaster = this.paymasters.get(chainId);
    if (!paymaster) {
      return '0';
    }

    const tokenContract = new ethers.Contract(
      paymaster.stableToken,
      ['function balanceOf(address) view returns (uint256)'],
      provider
    );

    const balance = await tokenContract.balanceOf(address);
    return ethers.formatUnits(balance, 6);
  }
}

// Export singleton instance
export const paymasterService = PaymasterService.getInstance();