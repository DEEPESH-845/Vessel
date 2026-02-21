/**
 * ENS Resolver Service
 * Handles ENS name resolution, reverse lookup, and caching
 * Requirements: FR-7.1, FR-7.2, FR-7.4
 */

import { ethers } from 'ethers';

/**
 * ENS Profile with all resolved data
 */
export interface ENSResolvedProfile {
  name: string | null;
  address: string;
  avatar: string | null;
  description: string | null;
  twitter: string | null;
  github: string | null;
  email: string | null;
  url: string | null;
}

/**
 * Cache entry with TTL
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * ENS Resolver Service
 * Provides forward/reverse resolution with caching
 */
export class ENSResolverService {
  private static instance: ENSResolverService;
  
  // LRU Cache with TTL
  private forwardCache = new Map<string, CacheEntry<string>>();
  private reverseCache = new Map<string, CacheEntry<string>>();
  private profileCache = new Map<string, CacheEntry<ENSResolvedProfile>>();
  
  // TTL in milliseconds
  private readonly FORWARD_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly REVERSE_TTL = 60 * 60 * 1000; // 1 hour
  private readonly PROFILE_TTL = 15 * 60 * 1000; // 15 minutes
  
  // Max cache size
  private readonly MAX_CACHE_SIZE = 1000;
  
  // Provider instances per chain
  private providers = new Map<number, ethers.JsonRpcProvider>();

  private constructor() {}

  static getInstance(): ENSResolverService {
    if (!ENSResolverService.instance) {
      ENSResolverService.instance = new ENSResolverService();
    }
    return ENSResolverService.instance;
  }

  /**
   * Get or create provider for a chain
   */
  private getProvider(chainId: number): ethers.JsonRpcProvider {
    if (!this.providers.has(chainId)) {
      // Mainnet is the only chain with ENS
      const rpcUrl = this.getRPCUrl(chainId);
      this.providers.set(chainId, new ethers.JsonRpcProvider(rpcUrl));
    }
    return this.providers.get(chainId)!;
  }

  /**
   * Get RPC URL for chain
   */
  private getRPCUrl(chainId: number): string {
    const urls: Record<number, string> = {
      1: process.env.NEXT_PUBLIC_ETHEREUM_RPC || 'https://eth.llamarpc.com',
      137: process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://polygon.llamarpc.com',
      42161: process.env.NEXT_PUBLIC_ARBITRUM_RPC || 'https://arbitrum.llamarpc.com',
      8453: process.env.NEXT_PUBLIC_BASE_RPC || 'https://base.llamarpc.com',
    };
    return urls[chainId] || urls[1];
  }

  /**
   * Forward resolution: ENS name -> Address
   */
  async resolveName(name: string, chainId: number = 1): Promise<string | null> {
    // Normalize name
    const normalizedName = name.toLowerCase().trim();
    
    // Check cache
    const cacheKey = `${chainId}:${normalizedName}`;
    const cached = this.forwardCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.FORWARD_TTL) {
      return cached.data;
    }

    try {
      const provider = this.getProvider(chainId);
      const address = await provider.resolveName(normalizedName);
      
      // Cache result
      this.addToCache(this.forwardCache, cacheKey, address || '');
      
      return address;
    } catch (error) {
      console.error(`ENS resolution failed for ${name}:`, error);
      return null;
    }
  }

  /**
   * Reverse resolution: Address -> ENS name
   */
  async lookupAddress(address: string, chainId: number = 1): Promise<string | null> {
    // Normalize address
    const normalizedAddress = ethers.getAddress(address);
    
    // Check cache
    const cacheKey = `${chainId}:${normalizedAddress}`;
    const cached = this.reverseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.REVERSE_TTL) {
      return cached.data || null;
    }

    try {
      const provider = this.getProvider(chainId);
      const name = await provider.lookupAddress(normalizedAddress);
      
      // Cache result
      this.addToCache(this.reverseCache, cacheKey, name || '');
      
      return name;
    } catch (error) {
      console.error(`ENS reverse lookup failed for ${address}:`, error);
      return null;
    }
  }

  /**
   * Resolve full ENS profile
   */
  async resolveProfile(addressOrName: string, chainId: number = 1): Promise<ENSResolvedProfile> {
    let address: string;
    let name: string | null = null;

    // Determine if input is address or name
    const isAddress = ethers.isAddress(addressOrName);
    
    if (isAddress) {
      address = ethers.getAddress(addressOrName);
      name = await this.lookupAddress(address, chainId);
    } else {
      const inputName = addressOrName as string;
      name = inputName.toLowerCase().trim();
      const resolved = await this.resolveName(name, chainId);
      if (!resolved) {
        throw new Error(`Could not resolve ENS name: ${name}`);
      }
      address = resolved;
    }

    // Check profile cache
    const cacheKey = `${chainId}:${address}`;
    const cached = this.profileCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.PROFILE_TTL) {
      return cached.data;
    }

    try {
      const provider = this.getProvider(chainId);
      
      // Fetch avatar
      const avatar = await this.fetchAvatar(name, provider);
      
      // Fetch text records
      const [description, twitter, github, email, url] = await Promise.all([
        this.fetchTextRecord(name, 'description', provider),
        this.fetchTextRecord(name, 'com.twitter', provider),
        this.fetchTextRecord(name, 'com.github', provider),
        this.fetchTextRecord(name, 'email', provider),
        this.fetchTextRecord(name, 'url', provider),
      ]);

      const profile: ENSResolvedProfile = {
        name,
        address,
        avatar,
        description,
        twitter,
        github,
        email,
        url,
      };

      // Cache result
      this.addToCache(this.profileCache, cacheKey, profile);

      return profile;
    } catch (error) {
      console.error(`ENS profile resolution failed for ${addressOrName}:`, error);
      
      // Return basic profile with address only
      return {
        name,
        address,
        avatar: null,
        description: null,
        twitter: null,
        github: null,
        email: null,
        url: null,
      };
    }
  }

  /**
   * Fetch avatar URL from ENS
   */
  private async fetchAvatar(name: string | null, provider: ethers.JsonRpcProvider): Promise<string | null> {
    if (!name) return null;

    try {
      const resolver = await provider.getResolver(name);
      if (!resolver) return null;

      // In ethers v6, getAvatar returns a string directly
      const avatar = await resolver.getAvatar() as string | null;
      return avatar || null;
    } catch {
      return null;
    }
  }

  /**
   * Fetch a text record from ENS
   */
  private async fetchTextRecord(
    name: string | null,
    key: string,
    provider: ethers.JsonRpcProvider
  ): Promise<string | null> {
    if (!name) return null;

    try {
      const resolver = await provider.getResolver(name);
      if (!resolver) return null;

      return await resolver.getText(key);
    } catch {
      return null;
    }
  }

  /**
   * Validate ENS name format
   */
  isValidENSName(name: string): boolean {
    // Basic ENS name validation
    const ensRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i;
    return ensRegex.test(name.toLowerCase().trim());
  }

  /**
   * Check if a string looks like an ENS name
   */
  looksLikeENSName(input: string): boolean {
    return input.includes('.') && !input.startsWith('0x');
  }

  /**
   * Get display name for an address
   * Returns ENS name if available, otherwise truncated address
   */
  async getDisplayName(address: string, chainId: number = 1): Promise<string> {
    const name = await this.lookupAddress(address, chainId);
    if (name) return name;
    
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Resolve multiple addresses in batch
   */
  async batchLookupAddresses(
    addresses: string[],
    chainId: number = 1
  ): Promise<Map<string, string | null>> {
    const results = new Map<string, string | null>();
    
    await Promise.all(
      addresses.map(async (address) => {
        const name = await this.lookupAddress(address, chainId);
        results.set(ethers.getAddress(address), name);
      })
    );

    return results;
  }

  /**
   * Add entry to cache with LRU eviction
   */
  private addToCache<T>(cache: Map<string, CacheEntry<T>>, key: string, data: T): void {
    // Evict oldest entries if cache is full
    if (cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey) {
        cache.delete(oldestKey);
      }
    }

    cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.forwardCache.clear();
    this.reverseCache.clear();
    this.profileCache.clear();
  }

  /**
   * Clear expired entries from all caches
   */
  clearExpiredCache(): void {
    const now = Date.now();

    this.forwardCache.forEach((entry, key) => {
      if (now - entry.timestamp > this.FORWARD_TTL) {
        this.forwardCache.delete(key);
      }
    });

    this.reverseCache.forEach((entry, key) => {
      if (now - entry.timestamp > this.REVERSE_TTL) {
        this.reverseCache.delete(key);
      }
    });

    this.profileCache.forEach((entry, key) => {
      if (now - entry.timestamp > this.PROFILE_TTL) {
        this.profileCache.delete(key);
      }
    });
  }
}

// Export singleton instance
export const ensResolverService = ENSResolverService.getInstance();