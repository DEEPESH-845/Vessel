/**
 * RPC Provider Configuration
 * Configures RPC providers for Ethereum, Polygon, Arbitrum, Base, Lisk
 * Requirements: FR-11.1, NFR-1.4
 */

import { ethers, JsonRpcProvider } from 'ethers';

/**
 * Chain configuration
 */
export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrl: string;
  isTestnet?: boolean;
}

/**
 * Supported chains configuration
 */
export const CHAIN_CONFIGS: Record<number, ChainConfig> = {
  1: {
    chainId: 1,
    name: 'Ethereum',
    rpcUrls: [
      'https://eth.llamarpc.com',
      'https://rpc.ankr.com/eth',
      'https://ethereum.publicnode.com',
    ],
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrl: 'https://etherscan.io',
  },
  137: {
    chainId: 137,
    name: 'Polygon',
    rpcUrls: [
      'https://polygon.llamarpc.com',
      'https://rpc.ankr.com/polygon',
      'https://polygon-rpc.com',
    ],
    nativeCurrency: {
      name: 'Polygon',
      symbol: 'MATIC',
      decimals: 18,
    },
    blockExplorerUrl: 'https://polygonscan.com',
  },
  42161: {
    chainId: 42161,
    name: 'Arbitrum',
    rpcUrls: [
      'https://arbitrum.llamarpc.com',
      'https://rpc.ankr.com/arbitrum',
      'https://arb1.arbitrum.io/rpc',
    ],
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrl: 'https://arbiscan.io',
  },
  8453: {
    chainId: 8453,
    name: 'Base',
    rpcUrls: [
      'https://mainnet.base.org',
      'https://base.llamarpc.com',
      'https://rpc.ankr.com/base',
    ],
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrl: 'https://basescan.org',
  },
  // Lisk Mainnet
  1135: {
    chainId: 1135,
    name: 'Lisk',
    rpcUrls: [
      'https://rpc.lisk.com',
      'https://lisk-rpc.altcoin.io',
    ],
    nativeCurrency: {
      name: 'Lisk',
      symbol: 'LSK',
      decimals: 18,
    },
    blockExplorerUrl: 'https://lisk.com',
  },
  // Lisk Sepolia Testnet
  4202: {
    chainId: 4202,
    name: 'Lisk Sepolia',
    rpcUrls: [
      'https://rpc.sepolia.lisk.com',
      'https://lisk-sepolia-rpc.altcoin.io',
    ],
    nativeCurrency: {
      name: 'Lisk',
      symbol: 'LSK',
      decimals: 18,
    },
    blockExplorerUrl: 'https://sepolia.lisk.com',
    isTestnet: true,
  },
};

/**
 * Provider cache with failover support
 */
const providerCache = new Map<number, JsonRpcProvider>();
const failedRPCs = new Map<number, Set<string>>();

/**
 * Get RPC provider for a chain with automatic failover
 */
export function getRPCProvider(chainId: number): JsonRpcProvider {
  // Return cached provider if available
  if (providerCache.has(chainId)) {
    return providerCache.get(chainId)!;
  }

  const config = CHAIN_CONFIGS[chainId];
  if (!config) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  // Get failed RPCs for this chain
  const failed = failedRPCs.get(chainId) || new Set<string>();

  // Find first working RPC URL
  for (const rpcUrl of config.rpcUrls) {
    if (!failed.has(rpcUrl)) {
      try {
        const provider = new JsonRpcProvider(rpcUrl, chainId, {
          staticNetwork: true,
        });

        // Cache the provider
        providerCache.set(chainId, provider);
        return provider;
      } catch (error) {
        console.error(`Failed to create provider for ${rpcUrl}:`, error);
        failed.add(rpcUrl);
        failedRPCs.set(chainId, failed);
      }
    }
  }

  // If all RPCs failed, try the first one anyway
  const provider = new JsonRpcProvider(config.rpcUrls[0], chainId, {
    staticNetwork: true,
  });
  providerCache.set(chainId, provider);
  return provider;
}

/**
 * Mark an RPC URL as failed for a chain
 */
export function markRPCFailed(chainId: number, rpcUrl: string): void {
  const failed = failedRPCs.get(chainId) || new Set<string>();
  failed.add(rpcUrl);
  failedRPCs.set(chainId, failed);

  // Clear provider cache to force failover
  providerCache.delete(chainId);
}

/**
 * Reset failed RPC tracking for a chain
 */
export function resetRPCFailures(chainId: number): void {
  failedRPCs.delete(chainId);
  providerCache.delete(chainId);
}

/**
 * Get chain name by chain ID
 */
export function getChainName(chainId: number): string {
  return CHAIN_CONFIGS[chainId]?.name || `Chain ${chainId}`;
}

/**
 * Get chain config by chain ID
 */
export function getChainConfig(chainId: number): ChainConfig | undefined {
  return CHAIN_CONFIGS[chainId];
}

/**
 * Get all supported chain IDs
 */
export function getSupportedChainIds(): number[] {
  return Object.keys(CHAIN_CONFIGS).map(Number);
}

/**
 * Check if a chain is supported
 */
export function isChainSupported(chainId: number): boolean {
  return chainId in CHAIN_CONFIGS;
}

/**
 * Get block explorer URL for a transaction
 */
export function getBlockExplorerTxUrl(chainId: number, txHash: string): string {
  const config = CHAIN_CONFIGS[chainId];
  if (!config) {
    return '';
  }
  return `${config.blockExplorerUrl}/tx/${txHash}`;
}

/**
 * Get block explorer URL for an address
 */
export function getBlockExplorerAddressUrl(
  chainId: number,
  address: string
): string {
  const config = CHAIN_CONFIGS[chainId];
  if (!config) {
    return '';
  }
  return `${config.blockExplorerUrl}/address/${address}`;
}

/**
 * Clear all provider caches
 */
export function clearProviderCache(): void {
  providerCache.clear();
  failedRPCs.clear();
}
