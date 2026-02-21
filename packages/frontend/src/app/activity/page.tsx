/**
 * Activity Page
 * 
 * Displays comprehensive transaction history across all chains with filtering,
 * search, and export capabilities.
 * 
 * Requirements: FR-1.1, FR-1.2, FR-1.4
 */

'use client';

import { useState, useMemo, useCallback, Suspense, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import ActivityList from '@/components/activity-list';
import ActivityFilterPanel from '@/components/activity-filter-panel';
import ActivitySearch from '@/components/activity-search';
import ActivityExportDialog from '@/components/activity-export-dialog';
import ParticleField from '@/components/particle-field';
import ScrollProgress from '@/components/scroll-progress';
import SkeletonLoader from '@/components/skeleton-loader';
import { useTransactions } from '@/store';
import { ActivityFilter, ActivityTransaction } from '@/types/transaction.types';
import { searchTransactions } from '@/utils/search.utils';
import { FileDown, ArrowLeft, History } from 'lucide-react';

export default function ActivityPage() {
  const router = useRouter();
  const { transactions, isLoading } = useTransactions();
  const [activeFilters, setActiveFilters] = useState<ActivityFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const backgroundOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (data.user) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.replace('/');
        }
      } catch (error) {
        setIsAuthenticated(false);
        router.replace('/');
      }
    };

    checkAuth();
  }, [router]);

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

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0A' }}>
        <SkeletonLoader variant="balance" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div 
      ref={containerRef}
      className="min-h-screen relative overflow-hidden" 
      style={{ background: '#0A0A0A' }}
    >
      {/* Scroll progress indicator */}
      <ScrollProgress />

      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          y: backgroundY,
          opacity: backgroundOpacity,
          background:
            "radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.08), transparent 50%), radial-gradient(circle at 80% 20%, rgba(204, 255, 0, 0.04), transparent 40%)",
        }}
        aria-hidden="true"
      />

      {/* Enhanced particle field */}
      <ParticleField count={15} color="rgba(204, 255, 0, 0.15)" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div 
          className="sticky top-0 z-10"
          style={{ 
            background: 'rgba(10, 10, 10, 0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(39, 39, 42, 0.8)',
          }}
        >
          <div className="max-w-4xl mx-auto px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Back button */}
                <motion.button
                  onClick={() => router.push('/wallet')}
                  whileHover={{ scale: 1.05, x: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(145deg, rgba(24, 24, 27, 0.95), rgba(24, 24, 27, 0.8))",
                    border: "1px solid rgba(39, 39, 42, 0.8)",
                  }}
                  aria-label="Back to wallet"
                >
                  <ArrowLeft className="w-4 h-4 text-[#CCFF00]" />
                </motion.button>
                
                <div>
                  <h1
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: "clamp(20px, 4vw, 24px)",
                      fontWeight: 700,
                      color: '#FFFFFF',
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Activity
                  </h1>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "14px",
                      color: '#71717A',
                    }}
                  >
                    View all your transactions across chains
                  </p>
                </div>
              </div>
              
              <motion.button
                onClick={() => setIsExportDialogOpen(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2.5 transition-all"
                style={{
                  background: "linear-gradient(135deg, #CCFF00, #B3E600)",
                  color: '#0A0A0A',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  fontWeight: 600,
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(204, 255, 0, 0.2)',
                }}
              >
                <FileDown size={18} />
                Export
              </motion.button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-4xl mx-auto px-6 py-6">
          {/* Search Input */}
          <div className="mb-4">
            <ActivitySearch onSearchChange={handleSearchChange} />
          </div>

          {/* Filter Panel */}
          <div className="mb-6">
            <Suspense fallback={<div className="h-12" />}>
              <ActivityFilterPanel
                onFilterChange={setActiveFilters}
                availableChains={availableChains}
                availableTokens={availableTokens}
              />
            </Suspense>
          </div>

          {/* Transaction List */}
          <ActivityList 
            transactions={filteredTransactions} 
            isLoading={isLoading}
            searchQuery={searchQuery}
          />
        </div>
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
