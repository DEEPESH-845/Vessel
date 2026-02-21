/**
 * Chain Aggregator Service
 * Aggregates balances across multiple chains with parallel RPC calls
 * Requirements: FR-11.1, NFR-1.4
 */

import { ethers } from 'ethers';
import {
  AssetDashboard,
  UnifiedAsset,
  TokenMetadata,
  NFTMetadata,
  DeFiMetadata,
} from '@/types/multi-chain.types';
import { PendingTransaction } from '@/types/transaction.types';
import { getRPCProvider, getChainName } from './rpc-provider.config';
import { getTokensForChain, getTokenBalance } from './token-balance.service';
import { getNFTsForAddress } from './nft-query.service';
import { getDeFiPositions } from './defi-position.service';

/**
 * Cache for balance data with 30s TTL
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 30000; // 30 seconds
const balanceCache = new Map<string, CacheEntry<AssetDashboard>>();

/**
 * Aggregate balances across all active chains
 * Completes within 2 seconds using parallel RPC calls
 */
export async function aggregateMultiChainBalances(
  address: string,
  chains: number[]
): Promise<AssetDashboard> {
  // Validate address
  if (!ethers.isAddress(address)) {
    throw new Error('Invalid Ethereum address');
  }

  // Check cache
  const cacheKey = `${address}-${chains.sort().join(',')}`;
  const cached = balanceCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const results: UnifiedAsset[] = [];
  const pendingTxs: PendingTransaction[] = [];

  // Parallel fetch across all chains with timeout
  const chainPromises = chains.map(async (chainId) => {
    try {
      const provider = getRPCProvider(chainId);
      const chainName = getChainName(chainId);

      // Fetch native token balance
      const nativeBalance = await provider.getBalance(address);
      if (nativeBalance > 0n) {
        const nativeAsset = await createNativeAsset(chainId, chainName, nativeBalance);
        results.push(nativeAsset);
      }

      // Fetch ERC-20 token balances
      const tokens = await getTokensForChain(chainId);
      const tokenBalances = await Promise.all(
        tokens.map((token) => getTokenBalance(address, token, provider))
      );

      tokenBalances.forEach((balance, idx) => {
        if (balance && parseFloat(balance.balance) > 0) {
          results.push(createTokenAsset(tokens[idx], balance, chainId, chainName));
        }
      });

      // Fetch NFTs
      const nfts = await getNFTsForAddress(address, chainId);
      results.push(...nfts.map((nft) => createNFTAsset(nft, chainId, chainName)));

      // Fetch DeFi positions
      const defiPositions = await getDeFiPositions(address, chainId);
      results.push(
        ...defiPositions.map((pos) => createDeFiAsset(pos, chainId, chainName))
      );

      // Fetch pending transactions
      const pending = await getPendingTransactions(address, chainId);
      pendingTxs.push(...pending);
    } catch (error) {
      console.error(`Error fetching balances for chain ${chainId}:`, error);
      // Continue with other chains even if one fails
    }
  });

  // Wait for all chains with 2 second timeout
  await Promise.race([
    Promise.all(chainPromises),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Balance aggregation timeout')), 2000)
    ),
  ]).catch((error) => {
    console.warn('Some chain queries timed out:', error);
    // Continue with partial results
  });

  // Calculate total value in USD
  const totalValue = results
    .reduce((sum, asset) => sum + parseFloat(asset.value || '0'), 0)
    .toFixed(2);

  const dashboard: AssetDashboard = {
    totalValue,
    tokens: results.filter((a) => a.type === 'token'),
    nfts: results.filter((a) => a.type === 'nft'),
    defiPositions: results.filter((a) => a.type === 'defi-position'),
    pendingTransactions: pendingTxs,
    lastUpdated: new Date(),
  };

  // Cache the result
  balanceCache.set(cacheKey, {
    data: dashboard,
    timestamp: Date.now(),
  });

  return dashboard;
}

/**
 * Create native token asset (ETH, MATIC, etc.)
 */
async function createNativeAsset(
  chainId: number,
  chainName: string,
  balance: bigint
): Promise<UnifiedAsset> {
  const nativeTokens: Record<number, { symbol: string; name: string; decimals: number }> =
    {
      1: { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
      137: { symbol: 'MATIC', name: 'Polygon', decimals: 18 },
      42161: { symbol: 'ETH', name: 'Arbitrum', decimals: 18 },
      8453: { symbol: 'ETH', name: 'Base', decimals: 18 },
    };

  const token = nativeTokens[chainId] || {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
  };
  const balanceFormatted = ethers.formatUnits(balance, token.decimals);

  // Fetch price (mock for now, should integrate with price oracle)
  const price = await getNativeTokenPrice(chainId);
  const value = (parseFloat(balanceFormatted) * price).toFixed(2);

  const metadata: TokenMetadata = {
    address: ethers.ZeroAddress,
    symbol: token.symbol,
    name: token.name,
    decimals: token.decimals,
    balance: balanceFormatted,
    price,
    priceChange24h: 0, // TODO: Fetch from price oracle
  };

  return {
    type: 'token',
    chain: chainName,
    chainId,
    value,
    metadata,
  };
}

/**
 * Create ERC-20 token asset
 */
function createTokenAsset(
  token: any,
  balance: { balance: string; decimals: number },
  chainId: number,
  chainName: string
): UnifiedAsset {
  const price = token.price || 0;
  const value = (parseFloat(balance.balance) * price).toFixed(2);

  const metadata: TokenMetadata = {
    address: token.address,
    symbol: token.symbol,
    name: token.name,
    decimals: balance.decimals,
    balance: balance.balance,
    price,
    priceChange24h: token.priceChange24h || 0,
    logo: token.logo,
  };

  return {
    type: 'token',
    chain: chainName,
    chainId,
    value,
    metadata,
  };
}

/**
 * Create NFT asset
 */
function createNFTAsset(
  nft: any,
  chainId: number,
  chainName: string
): UnifiedAsset {
  const floorPrice = nft.floorPrice || 0;

  const metadata: NFTMetadata = {
    contractAddress: nft.contractAddress,
    tokenId: nft.tokenId,
    name: nft.name,
    description: nft.description,
    image: nft.image,
    collection: nft.collection,
    floorPrice,
  };

  return {
    type: 'nft',
    chain: chainName,
    chainId,
    value: floorPrice.toString(),
    metadata,
  };
}

/**
 * Create DeFi position asset
 */
function createDeFiAsset(
  position: any,
  chainId: number,
  chainName: string
): UnifiedAsset {
  const totalValue = (
    parseFloat(position.deposited || '0') + parseFloat(position.earned || '0')
  ).toFixed(2);

  const metadata: DeFiMetadata = {
    protocol: position.protocol,
    type: position.type,
    deposited: position.deposited,
    earned: position.earned,
    apy: position.apy || 0,
    claimable: position.claimable,
  };

  return {
    type: 'defi-position',
    chain: chainName,
    chainId,
    value: totalValue,
    metadata,
  };
}

/**
 * Get pending transactions for an address on a chain
 * This queries the local transaction store and optionally the RPC mempool
 */
async function getPendingTransactions(
  address: string,
  chainId: number
): Promise<PendingTransaction[]> {
  try {
    // Import the transaction store dynamically to avoid circular dependencies
    const { useTransactionStore } = await import('@/store/transactions.slice');
    
    // Get pending transactions from the store
    const state = useTransactionStore.getState();
    
    // Check both regular transactions (with pending status) and explicitly pending transactions
    const regularPending = state.transactions.filter(
      (tx) => 
        tx.status === 'pending' && 
        tx.chainId === chainId &&
        tx.from.toLowerCase() === address.toLowerCase()
    );
    
    const explicitPending = state.pendingTransactions.filter(
      (tx) => 
        tx.chainId === chainId &&
        tx.from.toLowerCase() === address.toLowerCase()
    );

    // Convert regular transactions to PendingTransaction format
    const regularConverted = regularPending.map((tx) => ({
      hash: tx.hash,
      type: tx.type,
      status: tx.status as 'pending' | 'confirming',
      from: tx.from,
      to: tx.to,
      value: tx.value,
      token: tx.token || '',
      chainId: tx.chainId,
      submittedAt: tx.timestamp,
      cancellable: true,
      chain: tx.chainId,
    }));

    // Combine both sources
    return [...regularConverted, ...explicitPending];
  } catch (error) {
    console.error('Error fetching pending transactions:', error);
    // Return empty array if store is not available
    return [];
  }
}

/**
 * Get native token price in USD
 */
async function getNativeTokenPrice(chainId: number): Promise<number> {
  // Mock prices - should integrate with CoinGecko, CoinMarketCap, or on-chain oracle
  const mockPrices: Record<number, number> = {
    1: 2500, // ETH
    137: 0.8, // MATIC
    42161: 2500, // ETH on Arbitrum
    8453: 2500, // ETH on Base
  };

  return mockPrices[chainId] || 0;
}

/**
 * Clear cache for an address
 */
export function clearBalanceCache(address?: string): void {
  if (address) {
    // Clear specific address
    for (const key of balanceCache.keys()) {
      if (key.startsWith(address)) {
        balanceCache.delete(key);
      }
    }
  } else {
    // Clear all cache
    balanceCache.clear();
  }
}

/**
 * Batch request helper for multiple RPC calls
 */
export async function batchRPCRequests<T>(
  requests: (() => Promise<T>)[]
): Promise<T[]> {
  // Execute requests in parallel with error handling
  const results = await Promise.allSettled(requests.map((req) => req()));

  return results.map((result, idx) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error(`Batch request ${idx} failed:`, result.reason);
      return null as T;
    }
  });
}
