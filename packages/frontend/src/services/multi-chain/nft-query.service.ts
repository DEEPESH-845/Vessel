/**
 * NFT Query Service
 * Queries NFT ownership across chains
 * Requirements: FR-11.1
 */

import { JsonRpcProvider, Contract } from 'ethers';

/**
 * ERC-721 ABI for NFT queries
 */
const ERC721_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
];

/**
 * NFT metadata interface
 */
export interface NFT {
  contractAddress: string;
  tokenId: string;
  name: string;
  description?: string;
  image: string;
  collection: string;
  floorPrice?: number;
}

/**
 * NFT collection interface
 */
interface NFTCollection {
  address: string;
  name: string;
  symbol: string;
}

/**
 * Popular NFT collections by chain
 * In production, this would come from an NFT indexer API
 */
const CHAIN_NFT_COLLECTIONS: Record<number, NFTCollection[]> = {
  1: [
    // Ethereum - would include popular collections
  ],
  137: [
    // Polygon
  ],
  42161: [
    // Arbitrum
  ],
  8453: [
    // Base
  ],
};

/**
 * Get NFTs owned by an address on a chain
 * In production, this would use an NFT indexer like Alchemy, Moralis, or Reservoir
 */
export async function getNFTsForAddress(
  address: string,
  chainId: number
): Promise<NFT[]> {
  // For MVP, return empty array
  // In production, integrate with NFT indexer API:
  // - Alchemy NFT API
  // - Moralis NFT API
  // - Reservoir API
  // - OpenSea API
  
  try {
    // Mock implementation - would call NFT indexer
    const nfts: NFT[] = [];
    
    // Example: Query known collections
    const collections = CHAIN_NFT_COLLECTIONS[chainId] || [];
    
    for (const collection of collections) {
      const collectionNFTs = await queryNFTCollection(
        address,
        collection,
        chainId
      );
      nfts.push(...collectionNFTs);
    }
    
    return nfts;
  } catch (error) {
    console.error(`Error fetching NFTs for chain ${chainId}:`, error);
    return [];
  }
}

/**
 * Query NFTs from a specific collection
 */
async function queryNFTCollection(
  address: string,
  collection: NFTCollection,
  chainId: number
): Promise<NFT[]> {
  // This is a placeholder - in production would use NFT indexer
  // Direct contract queries are too slow for production use
  return [];
}

/**
 * Get NFT metadata from token URI
 */
async function getNFTMetadata(tokenURI: string): Promise<{
  name: string;
  description?: string;
  image: string;
} | null> {
  try {
    // Handle IPFS URIs
    let url = tokenURI;
    if (tokenURI.startsWith('ipfs://')) {
      url = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }

    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }

    const metadata = await response.json();
    
    // Handle IPFS image URLs
    let image = metadata.image || '';
    if (image.startsWith('ipfs://')) {
      image = image.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }

    return {
      name: metadata.name || 'Unknown',
      description: metadata.description,
      image,
    };
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    return null;
  }
}

/**
 * Get NFT floor price from marketplace
 * In production, integrate with OpenSea, Reservoir, or other marketplace APIs
 */
async function getNFTFloorPrice(
  contractAddress: string,
  chainId: number
): Promise<number | undefined> {
  // Mock implementation - would call marketplace API
  return undefined;
}

/**
 * Add custom NFT collection to track
 */
export function addNFTCollection(
  chainId: number,
  collection: NFTCollection
): void {
  if (!CHAIN_NFT_COLLECTIONS[chainId]) {
    CHAIN_NFT_COLLECTIONS[chainId] = [];
  }

  const exists = CHAIN_NFT_COLLECTIONS[chainId].some(
    (c) => c.address.toLowerCase() === collection.address.toLowerCase()
  );

  if (!exists) {
    CHAIN_NFT_COLLECTIONS[chainId].push(collection);
  }
}

/**
 * Remove NFT collection from tracking
 */
export function removeNFTCollection(
  chainId: number,
  collectionAddress: string
): void {
  if (!CHAIN_NFT_COLLECTIONS[chainId]) {
    return;
  }

  CHAIN_NFT_COLLECTIONS[chainId] = CHAIN_NFT_COLLECTIONS[chainId].filter(
    (c) => c.address.toLowerCase() !== collectionAddress.toLowerCase()
  );
}

/**
 * Check if address owns a specific NFT
 */
export async function ownsNFT(
  address: string,
  contractAddress: string,
  tokenId: string,
  provider: JsonRpcProvider
): Promise<boolean> {
  try {
    const contract = new Contract(contractAddress, ERC721_ABI, provider);
    const owner = await contract.ownerOf(tokenId);
    return owner.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error('Error checking NFT ownership:', error);
    return false;
  }
}
