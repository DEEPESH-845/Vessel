/**
 * Search Utilities
 * 
 * Helper functions for searching and highlighting transactions.
 */

import { EnhancedTransaction } from '@/types/transaction.types';

/**
 * Search transactions by hash, address, or ENS name
 */
export function searchTransactions(
  transactions: EnhancedTransaction[],
  query: string
): EnhancedTransaction[] {
  if (!query || query.trim() === '') {
    return transactions;
  }

  const normalizedQuery = query.toLowerCase().trim();

  return transactions.filter((tx) => {
    // Search by transaction hash
    if (tx.hash.toLowerCase().includes(normalizedQuery)) {
      return true;
    }

    // Search by recipient address
    if (tx.to.toLowerCase().includes(normalizedQuery)) {
      return true;
    }

    // Search by sender address
    if (tx.from.toLowerCase().includes(normalizedQuery)) {
      return true;
    }

    // Search by ENS name (if available in metadata)
    // Note: ENS resolution would be added in a future enhancement
    // For now, we check if the query looks like an ENS name
    if (normalizedQuery.endsWith('.eth')) {
      // This would be enhanced with actual ENS resolution
      return false;
    }

    return false;
  });
}

/**
 * Highlight matching text in a string
 */
export function highlightMatch(text: string, query: string): string {
  if (!query || query.trim() === '') {
    return text;
  }

  const normalizedQuery = query.toLowerCase().trim();
  const normalizedText = text.toLowerCase();
  const index = normalizedText.indexOf(normalizedQuery);

  if (index === -1) {
    return text;
  }

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);

  return `${before}<mark style="background: #CCFF0030; color: #CCFF00; padding: 0 2px; border-radius: 2px;">${match}</mark>${after}`;
}

/**
 * Format address for display with highlighting
 */
export function formatAddressWithHighlight(
  address: string,
  query: string,
  truncate: boolean = true
): string {
  if (!address) return '';

  let displayAddress = address;
  
  if (truncate && !query) {
    // Truncate address if no search query
    displayAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  return highlightMatch(displayAddress, query);
}

/**
 * Format transaction hash for display with highlighting
 */
export function formatHashWithHighlight(
  hash: string,
  query: string,
  truncate: boolean = true
): string {
  if (!hash) return '';

  let displayHash = hash;
  
  if (truncate && !query) {
    // Truncate hash if no search query
    displayHash = `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  }

  return highlightMatch(displayHash, query);
}
