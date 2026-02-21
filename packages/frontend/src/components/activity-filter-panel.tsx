/**
 * ActivityFilterPanel Component
 * 
 * Comprehensive filtering system for the activity page.
 * Supports filtering by chains, tokens, status, date range, and amount range.
 * Filters persist in URL query parameters.
 * 
 * Requirements: FR-1.2
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ActivityFilter } from '@/types/transaction.types';
import { X, ChevronDown, Calendar, DollarSign } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface ActivityFilterPanelProps {
  onFilterChange: (filters: ActivityFilter) => void;
  availableChains: string[];
  availableTokens: string[];
}

// Chain configuration
const CHAIN_NAMES: Record<string, string> = {
  '1': 'Ethereum',
  '137': 'Polygon',
  '42161': 'Arbitrum',
  '8453': 'Base',
};

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirming', label: 'Confirming' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
] as const;

export default function ActivityFilterPanel({
  onFilterChange,
  availableChains,
  availableTokens,
}: ActivityFilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL query parameters
  const [filters, setFilters] = useState<ActivityFilter>(() => {
    const chains = searchParams.get('chains')?.split(',').filter(Boolean);
    const tokens = searchParams.get('tokens')?.split(',').filter(Boolean);
    const status = searchParams.get('status')?.split(',').filter(Boolean) as ActivityFilter['status'];
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');

    return {
      chains: chains && chains.length > 0 ? chains : undefined,
      tokens: tokens && tokens.length > 0 ? tokens : undefined,
      status: status && status.length > 0 ? status : undefined,
      dateRange:
        startDate && endDate
          ? { start: new Date(startDate), end: new Date(endDate) }
          : undefined,
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
    };
  });

  const [showChainDropdown, setShowChainDropdown] = useState(false);
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showDateRange, setShowDateRange] = useState(false);
  const [showAmountRange, setShowAmountRange] = useState(false);

  // Update URL query parameters when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.chains && filters.chains.length > 0) {
      params.set('chains', filters.chains.join(','));
    }
    if (filters.tokens && filters.tokens.length > 0) {
      params.set('tokens', filters.tokens.join(','));
    }
    if (filters.status && filters.status.length > 0) {
      params.set('status', filters.status.join(','));
    }
    if (filters.dateRange) {
      params.set('startDate', filters.dateRange.start.toISOString());
      params.set('endDate', filters.dateRange.end.toISOString());
    }
    if (filters.minAmount !== undefined) {
      params.set('minAmount', filters.minAmount.toString());
    }
    if (filters.maxAmount !== undefined) {
      params.set('maxAmount', filters.maxAmount.toString());
    }

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;
    router.replace(newUrl, { scroll: false });

    onFilterChange(filters);
  }, [filters, onFilterChange, router]);

  // Toggle chain selection
  const toggleChain = (chainId: string) => {
    setFilters((prev) => {
      const currentChains = prev.chains || [];
      const newChains = currentChains.includes(chainId)
        ? currentChains.filter((c) => c !== chainId)
        : [...currentChains, chainId];
      return { ...prev, chains: newChains.length > 0 ? newChains : undefined };
    });
  };

  // Toggle token selection
  const toggleToken = (token: string) => {
    setFilters((prev) => {
      const currentTokens = prev.tokens || [];
      const newTokens = currentTokens.includes(token)
        ? currentTokens.filter((t) => t !== token)
        : [...currentTokens, token];
      return { ...prev, tokens: newTokens.length > 0 ? newTokens : undefined };
    });
  };

  // Toggle status selection
  const toggleStatus = (status: 'pending' | 'confirming' | 'completed' | 'failed') => {
    setFilters((prev) => {
      const currentStatus = prev.status || [];
      const newStatus = currentStatus.includes(status)
        ? currentStatus.filter((s) => s !== status)
        : [...currentStatus, status];
      return { ...prev, status: newStatus.length > 0 ? newStatus : undefined };
    });
  };

  // Update date range
  const updateDateRange = (start: string, end: string) => {
    if (start && end) {
      setFilters((prev) => ({
        ...prev,
        dateRange: { start: new Date(start), end: new Date(end) },
      }));
    } else {
      setFilters((prev) => {
        const { dateRange, ...rest } = prev;
        return rest;
      });
    }
  };

  // Update amount range
  const updateAmountRange = (min: string, max: string) => {
    setFilters((prev) => ({
      ...prev,
      minAmount: min ? parseFloat(min) : undefined,
      maxAmount: max ? parseFloat(max) : undefined,
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({});
    router.replace(window.location.pathname, { scroll: false });
  };

  // Check if any filters are active
  const hasActiveFilters =
    (filters.chains && filters.chains.length > 0) ||
    (filters.tokens && filters.tokens.length > 0) ||
    (filters.status && filters.status.length > 0) ||
    filters.dateRange !== undefined ||
    filters.minAmount !== undefined ||
    filters.maxAmount !== undefined;

  return (
    <div
      className="p-4 rounded-2xl mb-6"
      style={{
        background: '#18181B',
        border: '1px solid #27272A',
      }}
    >
      {/* Filter header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="font-semibold"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '16px',
            color: '#FFFFFF',
          }}
        >
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm hover:opacity-80 transition-opacity"
            style={{
              fontFamily: "'Inter', sans-serif",
              color: '#CCFF00',
            }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Chain filter */}
        <div className="relative">
          <button
            onClick={() => setShowChainDropdown(!showChainDropdown)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-opacity-80 transition-colors"
            style={{
              background: filters.chains && filters.chains.length > 0 ? '#CCFF0020' : '#27272A',
              border: filters.chains && filters.chains.length > 0 ? '1px solid #CCFF00' : 'none',
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              color: filters.chains && filters.chains.length > 0 ? '#CCFF00' : '#FFFFFF',
            }}
          >
            <span>
              Chains {filters.chains && filters.chains.length > 0 && `(${filters.chains.length})`}
            </span>
            <ChevronDown size={16} />
          </button>

          {showChainDropdown && (
            <div
              className="absolute top-full left-0 mt-2 p-2 rounded-lg shadow-lg z-10 min-w-[200px]"
              style={{
                background: '#18181B',
                border: '1px solid #27272A',
              }}
            >
              {availableChains.map((chainId) => (
                <label
                  key={chainId}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-opacity-80 transition-colors cursor-pointer"
                  style={{
                    background: filters.chains?.includes(chainId) ? '#27272A' : 'transparent',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={filters.chains?.includes(chainId) || false}
                    onChange={() => toggleChain(chainId)}
                    className="w-4 h-4"
                    style={{ accentColor: '#CCFF00' }}
                  />
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '14px',
                      color: '#FFFFFF',
                    }}
                  >
                    {CHAIN_NAMES[chainId] || `Chain ${chainId}`}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Token filter */}
        <div className="relative">
          <button
            onClick={() => setShowTokenDropdown(!showTokenDropdown)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-opacity-80 transition-colors"
            style={{
              background: filters.tokens && filters.tokens.length > 0 ? '#CCFF0020' : '#27272A',
              border: filters.tokens && filters.tokens.length > 0 ? '1px solid #CCFF00' : 'none',
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              color: filters.tokens && filters.tokens.length > 0 ? '#CCFF00' : '#FFFFFF',
            }}
          >
            <span>
              Tokens {filters.tokens && filters.tokens.length > 0 && `(${filters.tokens.length})`}
            </span>
            <ChevronDown size={16} />
          </button>

          {showTokenDropdown && (
            <div
              className="absolute top-full left-0 mt-2 p-2 rounded-lg shadow-lg z-10 min-w-[200px] max-h-[300px] overflow-y-auto"
              style={{
                background: '#18181B',
                border: '1px solid #27272A',
              }}
            >
              {availableTokens.map((token) => (
                <label
                  key={token}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-opacity-80 transition-colors cursor-pointer"
                  style={{
                    background: filters.tokens?.includes(token) ? '#27272A' : 'transparent',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={filters.tokens?.includes(token) || false}
                    onChange={() => toggleToken(token)}
                    className="w-4 h-4"
                    style={{ accentColor: '#CCFF00' }}
                  />
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '14px',
                      color: '#FFFFFF',
                    }}
                  >
                    {token}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Status filter */}
        <div className="relative">
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-opacity-80 transition-colors"
            style={{
              background: filters.status && filters.status.length > 0 ? '#CCFF0020' : '#27272A',
              border: filters.status && filters.status.length > 0 ? '1px solid #CCFF00' : 'none',
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              color: filters.status && filters.status.length > 0 ? '#CCFF00' : '#FFFFFF',
            }}
          >
            <span>
              Status {filters.status && filters.status.length > 0 && `(${filters.status.length})`}
            </span>
            <ChevronDown size={16} />
          </button>

          {showStatusDropdown && (
            <div
              className="absolute top-full left-0 mt-2 p-2 rounded-lg shadow-lg z-10 min-w-[200px]"
              style={{
                background: '#18181B',
                border: '1px solid #27272A',
              }}
            >
              {STATUS_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-opacity-80 transition-colors cursor-pointer"
                  style={{
                    background: filters.status?.includes(option.value) ? '#27272A' : 'transparent',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={filters.status?.includes(option.value) || false}
                    onChange={() => toggleStatus(option.value)}
                    className="w-4 h-4"
                    style={{ accentColor: '#CCFF00' }}
                  />
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '14px',
                      color: '#FFFFFF',
                    }}
                  >
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Date range filter */}
        <div className="relative">
          <button
            onClick={() => setShowDateRange(!showDateRange)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-opacity-80 transition-colors"
            style={{
              background: filters.dateRange ? '#CCFF0020' : '#27272A',
              border: filters.dateRange ? '1px solid #CCFF00' : 'none',
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              color: filters.dateRange ? '#CCFF00' : '#FFFFFF',
            }}
          >
            <Calendar size={16} />
            <span>Date Range</span>
          </button>

          {showDateRange && (
            <div
              className="absolute top-full left-0 mt-2 p-4 rounded-lg shadow-lg z-10 min-w-[300px]"
              style={{
                background: '#18181B',
                border: '1px solid #27272A',
              }}
            >
              <div className="space-y-3">
                <div>
                  <label
                    className="block text-xs mb-1"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      color: '#A1A1AA',
                    }}
                  >
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange?.start.toISOString().split('T')[0] || ''}
                    onChange={(e) =>
                      updateDateRange(
                        e.target.value,
                        filters.dateRange?.end.toISOString().split('T')[0] || ''
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      background: '#27272A',
                      border: '1px solid #3F3F46',
                      color: '#FFFFFF',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '14px',
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs mb-1"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      color: '#A1A1AA',
                    }}
                  >
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange?.end.toISOString().split('T')[0] || ''}
                    onChange={(e) =>
                      updateDateRange(
                        filters.dateRange?.start.toISOString().split('T')[0] || '',
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      background: '#27272A',
                      border: '1px solid #3F3F46',
                      color: '#FFFFFF',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Amount range filter */}
        <div className="relative">
          <button
            onClick={() => setShowAmountRange(!showAmountRange)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-opacity-80 transition-colors"
            style={{
              background:
                filters.minAmount !== undefined || filters.maxAmount !== undefined
                  ? '#CCFF0020'
                  : '#27272A',
              border:
                filters.minAmount !== undefined || filters.maxAmount !== undefined
                  ? '1px solid #CCFF00'
                  : 'none',
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              color:
                filters.minAmount !== undefined || filters.maxAmount !== undefined
                  ? '#CCFF00'
                  : '#FFFFFF',
            }}
          >
            <DollarSign size={16} />
            <span>Amount Range</span>
          </button>

          {showAmountRange && (
            <div
              className="absolute top-full left-0 mt-2 p-4 rounded-lg shadow-lg z-10 min-w-[300px]"
              style={{
                background: '#18181B',
                border: '1px solid #27272A',
              }}
            >
              <div className="space-y-3">
                <div>
                  <label
                    className="block text-xs mb-1"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      color: '#A1A1AA',
                    }}
                  >
                    Min Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={filters.minAmount || ''}
                    onChange={(e) =>
                      updateAmountRange(e.target.value, filters.maxAmount?.toString() || '')
                    }
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      background: '#27272A',
                      border: '1px solid #3F3F46',
                      color: '#FFFFFF',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '14px',
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs mb-1"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      color: '#A1A1AA',
                    }}
                  >
                    Max Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={filters.maxAmount || ''}
                    onChange={(e) =>
                      updateAmountRange(filters.minAmount?.toString() || '', e.target.value)
                    }
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      background: '#27272A',
                      border: '1px solid #3F3F46',
                      color: '#FFFFFF',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: '#27272A' }}>
          <div className="flex flex-wrap gap-2">
            {filters.chains?.map((chainId) => (
              <div
                key={chainId}
                className="flex items-center gap-2 px-3 py-1 rounded-lg"
                style={{
                  background: '#27272A',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '12px',
                  color: '#FFFFFF',
                }}
              >
                <span>{CHAIN_NAMES[chainId] || `Chain ${chainId}`}</span>
                <button
                  onClick={() => toggleChain(chainId)}
                  className="hover:opacity-80 transition-opacity"
                  style={{ color: '#A1A1AA' }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {filters.tokens?.map((token) => (
              <div
                key={token}
                className="flex items-center gap-2 px-3 py-1 rounded-lg"
                style={{
                  background: '#27272A',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '12px',
                  color: '#FFFFFF',
                }}
              >
                <span>{token}</span>
                <button
                  onClick={() => toggleToken(token)}
                  className="hover:opacity-80 transition-opacity"
                  style={{ color: '#A1A1AA' }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {filters.status?.map((status) => (
              <div
                key={status}
                className="flex items-center gap-2 px-3 py-1 rounded-lg capitalize"
                style={{
                  background: '#27272A',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '12px',
                  color: '#FFFFFF',
                }}
              >
                <span>{status}</span>
                <button
                  onClick={() => toggleStatus(status)}
                  className="hover:opacity-80 transition-opacity"
                  style={{ color: '#A1A1AA' }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
