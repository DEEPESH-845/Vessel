/**
 * Activity Page
 * 
 * Displays comprehensive transaction history across all chains with filtering,
 * search, and export capabilities.
 * 
 * Requirements: FR-1.1, FR-1.2, FR-1.4
 */

'use client';

import { useState, useMemo, useCallback, Suspense } from 'react';
import ActivityList from '@/components/activity-list';
import ActivityFilterPanel from '@/components/activity-filter-panel';
import ActivitySearch from '@/components/activity-search';
import ActivityExportDialog from '@/components/activity-export-dialog';
import { useTransactions } from '@/store';
import { ActivityFilter, ActivityTransaction } from '@/types/transaction.types';
import { searchTransactions } from '@/utils/search.utils';
import { FileDown } from 'lucide-react';

export default function ActivityPage() {
  const { transactions, isLoading } = useTransactions();
  const [activeFilters, setActiveFilters] = useState<ActivityFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  // Handle search query changes
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Extract available chains and tokens from transactions
  const { availableChains, availableTokens } = useMemo(() => {
    const chains = new Set<string>();
    const tokens = new Set<string>();

    transactions.forEach((tx) => {
      chains.add(tx.chainId.toString());
      if (tx.token) {
        tokens.add(tx.token);
      } else {
        // Add native token based on chain
        const nativeTokens: Record<number, string> = {
          1: 'ETH',
          137: 'MATIC',
          42161: 'ETH',
          8453: 'ETH',
        };
        tokens.add(nativeTokens[tx.chainId] || 'ETH');
      }
    });

    return {
      availableChains: Array.from(chains).sort(),
      availableTokens: Array.from(tokens).sort(),
    };
  }, [transactions]);

  // Apply filters to transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Apply search first
    if (searchQuery) {
      filtered = searchTransactions(filtered, searchQuery);
    }

    // Filter by chains
    if (activeFilters.chains && activeFilters.chains.length > 0) {
      filtered = filtered.filter((tx) =>
        activeFilters.chains!.includes(tx.chainId.toString())
      );
    }

    // Filter by tokens
    if (activeFilters.tokens && activeFilters.tokens.length > 0) {
      filtered = filtered.filter((tx) => {
        const txToken = tx.token || (() => {
          const nativeTokens: Record<number, string> = {
            1: 'ETH',
            137: 'MATIC',
            42161: 'ETH',
            8453: 'ETH',
          };
          return nativeTokens[tx.chainId] || 'ETH';
        })();
        return activeFilters.tokens!.includes(txToken);
      });
    }

    // Filter by status
    if (activeFilters.status && activeFilters.status.length > 0) {
      filtered = filtered.filter((tx) => activeFilters.status!.includes(tx.status));
    }

    // Filter by date range
    if (activeFilters.dateRange) {
      const { start, end } = activeFilters.dateRange;
      filtered = filtered.filter((tx) => {
        const txDate = new Date(tx.timestamp);
        return txDate >= start && txDate <= end;
      });
    }

    // Filter by amount range
    if (activeFilters.minAmount !== undefined || activeFilters.maxAmount !== undefined) {
      filtered = filtered.filter((tx) => {
        const amount = parseFloat(tx.value);
        if (activeFilters.minAmount !== undefined && amount < activeFilters.minAmount) {
          return false;
        }
        if (activeFilters.maxAmount !== undefined && amount > activeFilters.maxAmount) {
          return false;
        }
        return true;
      });
    }

    return filtered;
  }, [transactions, activeFilters, searchQuery]);

  // Convert to ActivityTransaction for export
  const getChainName = (chainId: number): string => {
    const chainNames: Record<number, string> = {
      1: 'Ethereum',
      137: 'Polygon',
      42161: 'Arbitrum',
      8453: 'Base',
    };
    return chainNames[chainId] || `Chain ${chainId}`;
  };

  const activityTransactions: ActivityTransaction[] = useMemo(() => {
    return filteredTransactions.map((tx) => ({
      ...tx,
      chain: getChainName(tx.chainId),
    }));
  }, [filteredTransactions]);

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0A' }}>
      {/* Header */}
      <div className="sticky top-0 z-10" style={{ background: '#0A0A0A', borderBottom: '1px solid #27272A' }}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: '#FFFFFF',
                }}
              >
                Activity
              </h1>
              <p
                className="mt-1 text-sm"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  color: '#A1A1AA',
                }}
              >
                View all your transactions across chains
              </p>
            </div>
            <button
              onClick={() => setIsExportDialogOpen(true)}
              className="flex items-center gap-2 px-4 py-2 transition-all hover:opacity-80"
              style={{
                background: '#CCFF00',
                color: '#0A0A0A',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '8px',
              }}
            >
              <FileDown size={18} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Search Input */}
        <ActivitySearch onSearchChange={handleSearchChange} />

        {/* Filter Panel */}
        <Suspense fallback={<div className="h-12" />}>
          <ActivityFilterPanel
            onFilterChange={setActiveFilters}
            availableChains={availableChains}
            availableTokens={availableTokens}
          />
        </Suspense>

        {/* Transaction List */}
        <ActivityList 
          transactions={filteredTransactions} 
          isLoading={isLoading}
          searchQuery={searchQuery}
        />
      </div>

      {/* Export Dialog */}
      <ActivityExportDialog
        transactions={activityTransactions}
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
      />
    </div>
  );
}
