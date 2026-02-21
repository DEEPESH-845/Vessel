/**
 * Token Balance Service
 * Fetches ERC-20 token balances with batching support
 * Requirements: FR-11.1
 */

import { ethers, Contract, JsonRpcProvider } from 'ethers';

/**
 * ERC-20 ABI for balance queries
 */
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
];

/**
 * Token info interface
 */
export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logo?: string;
  price?: number;
  priceChange24h?: number;
}

/**
 * Token balance result
 */
export interface TokenBalance {
  balance: string;
  decimals: number;
  raw: bigint;
}

/**
 * Popular tokens by chain
 * In production, this would come from a token list API
 */
const CHAIN_TOKENS: Record<number, TokenInfo[]> = {
  1: [
    // Ethereum
    {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      price: 1.0,
    },
    {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      price: 1.0,
    },
    {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      price: 1.0,
    },
    {
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      decimals: 8,
      price: 45000,
    },
  ],
  137: [
    // Polygon
    {
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      price: 1.0,
    },
    {
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      price: 1.0,
    },
    {
      address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      price: 1.0,
    },
  ],
  42161: [
    // Arbitrum
    {
      address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      price: 1.0,
    },
    {
      address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      price: 1.0,
    },
    {
      address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      price: 1.0,
    },
  ],
  8453: [
    // Base
    {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      price: 1.0,
    },
    {
      address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      price: 1.0,
    },
  ],
};

/**
 * Get token list for a chain
 */
export async function getTokensForChain(chainId: number): Promise<TokenInfo[]> {
  return CHAIN_TOKENS[chainId] || [];
}

/**
 * Get token balance for an address
 */
export async function getTokenBalance(
  address: string,
  token: TokenInfo,
  provider: JsonRpcProvider
): Promise<TokenBalance | null> {
  try {
    const contract = new Contract(token.address, ERC20_ABI, provider);
    const balance = await contract.balanceOf(address);

    if (balance === 0n) {
      return null;
    }

    const formatted = ethers.formatUnits(balance, token.decimals);

    return {
      balance: formatted,
      decimals: token.decimals,
      raw: balance,
    };
  } catch (error) {
    console.error(`Error fetching balance for ${token.symbol}:`, error);
    return null;
  }
}

/**
 * Batch fetch token balances for multiple tokens
 */
export async function batchGetTokenBalances(
  address: string,
  tokens: TokenInfo[],
  provider: JsonRpcProvider
): Promise<Map<string, TokenBalance>> {
  const results = new Map<string, TokenBalance>();

  // Execute all balance queries in parallel
  const balancePromises = tokens.map(async (token) => {
    const balance = await getTokenBalance(address, token, provider);
    if (balance) {
      results.set(token.address, balance);
    }
  });

  await Promise.allSettled(balancePromises);

  return results;
}

/**
 * Get token info from contract
 */
export async function getTokenInfo(
  tokenAddress: string,
  provider: JsonRpcProvider
): Promise<TokenInfo | null> {
  try {
    const contract = new Contract(tokenAddress, ERC20_ABI, provider);

    const [symbol, name, decimals] = await Promise.all([
      contract.symbol(),
      contract.name(),
      contract.decimals(),
    ]);

    return {
      address: tokenAddress,
      symbol,
      name,
      decimals: Number(decimals),
    };
  } catch (error) {
    console.error(`Error fetching token info for ${tokenAddress}:`, error);
    return null;
  }
}

/**
 * Add custom token to chain token list
 */
export function addCustomToken(chainId: number, token: TokenInfo): void {
  if (!CHAIN_TOKENS[chainId]) {
    CHAIN_TOKENS[chainId] = [];
  }

  // Check if token already exists
  const exists = CHAIN_TOKENS[chainId].some(
    (t) => t.address.toLowerCase() === token.address.toLowerCase()
  );

  if (!exists) {
    CHAIN_TOKENS[chainId].push(token);
  }
}

/**
 * Remove custom token from chain token list
 */
export function removeCustomToken(chainId: number, tokenAddress: string): void {
  if (!CHAIN_TOKENS[chainId]) {
    return;
  }

  CHAIN_TOKENS[chainId] = CHAIN_TOKENS[chainId].filter(
    (t) => t.address.toLowerCase() !== tokenAddress.toLowerCase()
  );
}
