/**
 * ActivityList Component
 * 
 * Displays a paginated list of transactions with infinite scroll.
 * Shows 20 transactions per page and loads more as user scrolls.
 * 
 * Requirements: FR-1.1
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { EnhancedTransaction, ActivityTransaction } from '@/types/transaction.types';
import ActivityTransactionCard from './activity-transaction-card';

export interface ActivityListProps {
  transactions: EnhancedTransaction[];
  isLoading?: boolean;
  searchQuery?: string;
}

const ITEMS_PER_PAGE = 20;

export default function ActivityList({ transactions, isLoading = false, searchQuery = '' }: ActivityListProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  // Convert EnhancedTransaction to ActivityTransaction by adding chain name
  const getChainName = (chainId: number): string => {
    const chainNames: Record<number, string> = {
      1: 'Ethereum',
      137: 'Polygon',
      42161: 'Arbitrum',
      8453: 'Base',
    };
    return chainNames[chainId] || `Chain ${chainId}`;
  };

  const toActivityTransaction = (tx: EnhancedTransaction): ActivityTransaction => ({
    ...tx,
    chain: getChainName(tx.chainId),
  });

  // Calculate initial state from props
  const initialTransactions = React.useMemo(() => {
    return transactions.slice(0, ITEMS_PER_PAGE);
  }, [transactions]);

  const [displayedTransactions, setDisplayedTransactions] = useState<EnhancedTransaction[]>(initialTransactions);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(transactions.length > ITEMS_PER_PAGE);

  // Reset when transactions change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const newInitial = transactions.slice(0, ITEMS_PER_PAGE);
    setDisplayedTransactions(newInitial);
    setHasMore(transactions.length > ITEMS_PER_PAGE);
    setPage(1);
  }, [transactions]);

  // Load more transactions
  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return;

    const nextPage = page + 1;
    const startIndex = page * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const newTransactions = transactions.slice(startIndex, endIndex);

    if (newTransactions.length > 0) {
      setDisplayedTransactions((prev) => [...prev, ...newTransactions]);
      setPage(nextPage);
      setHasMore(endIndex < transactions.length);
    } else {
      setHasMore(false);
    }
  }, [page, transactions, hasMore, isLoading]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMore, hasMore, isLoading]);

  // Loading state
  if (isLoading && displayedTransactions.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            data-testid="skeleton-loader"
            className="relative overflow-hidden"
            style={{
              background: '#18181B',
              border: '1px solid #27272A',
              borderRadius: '20px',
              height: '120px',
            }}
          />
        ))}
      </div>
    );
  }

  // Empty state
  if (!isLoading && displayedTransactions.length === 0) {
    return (
      <div
        className="relative overflow-hidden text-center py-12"
        style={{
          background: '#18181B',
          border: '1px solid #27272A',
          borderRadius: '20px',
        }}
      >
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '16px',
            color: '#71717A',
          }}
        >
          No transactions found
        </p>
        <p
          className="mt-2"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
            color: '#52525B',
          }}
        >
          Your transaction history will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {displayedTransactions.map((transaction) => (
        <ActivityTransactionCard 
          key={transaction.id} 
          transaction={toActivityTransaction(transaction)}
          searchQuery={searchQuery}
        />
      ))}

      {/* Infinite scroll trigger */}
      {hasMore && (
        <div ref={observerTarget} className="py-4">
          <div
            className="relative overflow-hidden"
            style={{
              background: '#18181B',
              border: '1px solid #27272A',
              borderRadius: '20px',
              height: '120px',
            }}
          />
        </div>
      )}

      {/* End of list indicator */}
      {!hasMore && displayedTransactions.length > 0 && (
        <div className="text-center py-6">
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              color: '#52525B',
            }}
          >
            You&apos;ve reached the end
          </p>
        </div>
      )}
    </div>
  );
}
