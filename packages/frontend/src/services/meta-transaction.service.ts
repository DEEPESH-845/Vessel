/**
 * Meta-Transaction Service
 * Handles EIP-712 signing and relayer submission
 * Requirements: FR-4.1, FR-4.2, FR-4.3
 */

import { ethers } from 'ethers';

/**
 * Meta-Transaction Types
 */
export interface MetaTransaction {
  from: string;
  to: string;
  value: string;
  data: string;
  nonce: number;
  deadline: number;
  chainId: number;
}

export interface SignedMetaTransaction extends MetaTransaction {
  signature: string;
}

export interface RelayerConfig {
  endpoint: string;
  apiKey: string;
  supportedChains: number[];
}

export interface RelayerStatus {
  status: 'pending' | 'submitted' | 'confirmed' | 'failed';
  txHash?: string;
  blockNumber?: number;
  gasUsed?: string;
  error?: string;
}

/**
 * EIP-712 Domain for meta-transactions
 */
const EIP712_DOMAIN = {
  name: 'VesselWallet',
  version: '1',
};

/**
 * EIP-712 Types
 */
const EIP712_TYPES = {
  MetaTransaction: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'data', type: 'bytes' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
};

/**
 * Meta-Transaction Service
 * Creates and submits gasless transactions via relayer
 */
export class MetaTransactionService {
  private static instance: MetaTransactionService;
  
  private relayers: RelayerConfig[] = [];
  private statusCallbacks = new Map<string, (status: RelayerStatus) => void>();

  private constructor() {}

  static getInstance(): MetaTransactionService {
    if (!MetaTransactionService.instance) {
      MetaTransactionService.instance = new MetaTransactionService();
    }
    return MetaTransactionService.instance;
  }

  /**
   * Configure relayers
   */
  configureRelayers(relayers: RelayerConfig[]): void {
    this.relayers = relayers;
  }

  /**
   * Create EIP-712 typed data for signing
   */
  createTypedData(
    metaTx: MetaTransaction,
    verifyingContract: string
  ): any {
    const domain = {
      ...EIP712_DOMAIN,
      chainId: metaTx.chainId,
      verifyingContract,
    };

    return {
      domain,
      types: EIP712_TYPES,
      primaryType: 'MetaTransaction',
      message: metaTx,
    };
  }

  /**
   * Sign a meta-transaction using EIP-712
   */
  async signMetaTransaction(
    metaTx: MetaTransaction,
    verifyingContract: string,
    signer: ethers.Signer
  ): Promise<SignedMetaTransaction> {
    const typedData = this.createTypedData(metaTx, verifyingContract);
    
    // Sign using EIP-712
    const signature = await signer.signTypedData(
      typedData.domain,
      typedData.types,
      typedData.message
    );

    return {
      ...metaTx,
      signature,
    };
  }

  /**
   * Create a meta-transaction
   */
  createMetaTransaction(params: {
    from: string;
    to: string;
    value?: string;
    data?: string;
    nonce: number;
    deadline?: number;
    chainId: number;
  }): MetaTransaction {
    return {
      from: params.from,
      to: params.to,
      value: params.value || '0',
      data: params.data || '0x',
      nonce: params.nonce,
      deadline: params.deadline || Math.floor(Date.now() / 1000) + 3600, // 1 hour default
      chainId: params.chainId,
    };
  }

  /**
   * Submit meta-transaction to relayer
   */
  async submitToRelayer(
    signedTx: SignedMetaTransaction,
    verifyingContract: string
  ): Promise<{ txId: string }> {
    // Select best relayer for the chain
    const relayer = this.selectRelayer(signedTx.chainId);
    if (!relayer) {
      throw new Error(`No relayer available for chain ${signedTx.chainId}`);
    }

    try {
      const response = await fetch(`${relayer.endpoint}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': relayer.apiKey,
        },
        body: JSON.stringify({
          metaTransaction: signedTx,
          verifyingContract,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit to relayer');
      }

      const result = await response.json();
      
      // Start polling for status
      this.pollStatus(relayer, result.txId);
      
      return { txId: result.txId };
    } catch (error) {
      // Try fallback relayer
      const fallbackRelayer = this.selectFallbackRelayer(signedTx.chainId, relayer);
      if (fallbackRelayer) {
        return this.submitToRelayerWithConfig(signedTx, verifyingContract, fallbackRelayer);
      }
      throw error;
    }
  }

  /**
   * Submit to a specific relayer
   */
  private async submitToRelayerWithConfig(
    signedTx: SignedMetaTransaction,
    verifyingContract: string,
    relayer: RelayerConfig
  ): Promise<{ txId: string }> {
    const response = await fetch(`${relayer.endpoint}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': relayer.apiKey,
      },
      body: JSON.stringify({
        metaTransaction: signedTx,
        verifyingContract,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit to relayer');
    }

    const result = await response.json();
    this.pollStatus(relayer, result.txId);
    
    return { txId: result.txId };
  }

  /**
   * Select the best relayer for a chain
   */
  private selectRelayer(chainId: number): RelayerConfig | null {
    const available = this.relayers.filter((r) => r.supportedChains.includes(chainId));
    if (available.length === 0) return null;
    
    // For now, return first available. In production, check health/gas price
    return available[0];
  }

  /**
   * Select a fallback relayer
   */
  private selectFallbackRelayer(chainId: number, exclude: RelayerConfig): RelayerConfig | null {
    const available = this.relayers.filter(
      (r) => r.supportedChains.includes(chainId) && r !== exclude
    );
    return available.length > 0 ? available[0] : null;
  }

  /**
   * Poll relayer for transaction status
   */
  private async pollStatus(relayer: RelayerConfig, txId: string): Promise<void> {
    const poll = async () => {
      try {
        const response = await fetch(`${relayer.endpoint}/status/${txId}`, {
          headers: {
            'X-API-Key': relayer.apiKey,
          },
        });

        if (response.ok) {
          const status: RelayerStatus = await response.json();
          
          // Notify callback
          const callback = this.statusCallbacks.get(txId);
          if (callback) {
            callback(status);
          }

          // Continue polling if pending
          if (status.status === 'pending' || status.status === 'submitted') {
            setTimeout(poll, 3000);
          } else {
            // Clean up callback when done
            this.statusCallbacks.delete(txId);
          }
        }
      } catch (error) {
        console.error('Failed to poll status:', error);
        // Retry on error
        setTimeout(poll, 5000);
      }
    };

    poll();
  }

  /**
   * Subscribe to transaction status updates
   */
  onStatusUpdate(txId: string, callback: (status: RelayerStatus) => void): () => void {
    this.statusCallbacks.set(txId, callback);
    
    // Return unsubscribe function
    return () => {
      this.statusCallbacks.delete(txId);
    };
  }

  /**
   * Get current status from relayer
   */
  async getStatus(relayerEndpoint: string, txId: string): Promise<RelayerStatus> {
    const response = await fetch(`${relayerEndpoint}/status/${txId}`);
    
    if (!response.ok) {
      throw new Error('Failed to get status');
    }

    return response.json();
  }

  /**
   * Estimate gas for meta-transaction
   */
  async estimateGas(
    metaTx: MetaTransaction,
    provider: ethers.JsonRpcProvider
  ): Promise<bigint> {
    const estimated = await provider.estimateGas({
      from: metaTx.from,
      to: metaTx.to,
      value: metaTx.value,
      data: metaTx.data,
    });

    // Add 20% buffer
    return (estimated * 120n) / 100n;
  }

  /**
   * Verify signature locally
   */
  verifySignature(
    signedTx: SignedMetaTransaction,
    verifyingContract: string
  ): boolean {
    try {
      const typedData = this.createTypedData(signedTx, verifyingContract);
      
      // Recover signer address
      const hash = ethers.TypedDataEncoder.hash(
        typedData.domain,
        typedData.types,
        typedData.message
      );
      
      const recovered = ethers.recoverAddress(hash, signedTx.signature);
      
      return recovered.toLowerCase() === signedTx.from.toLowerCase();
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const metaTransactionService = MetaTransactionService.getInstance();