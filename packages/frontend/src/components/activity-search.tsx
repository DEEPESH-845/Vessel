/**
 * ActivitySearch Component
 * 
 * Search input for transaction history with debouncing.
 * Supports searching by transaction hash, recipient address, and ENS name.
 * 
 * Requirements: FR-1.3
 */

'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

export interface ActivitySearchProps {
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

export default function ActivitySearch({
  onSearchChange,
  placeholder = 'Search by hash, address, or ENS name...',
}: ActivitySearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Notify parent of debounced search query changes
  useEffect(() => {
    onSearchChange(debouncedQuery);
  }, [debouncedQuery, onSearchChange]);

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <div className="relative mb-6">
      <div className="relative">
        {/* Search icon */}
        <div
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: '#71717A' }}
        >
          <Search size={20} />
        </div>

        {/* Search input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3 rounded-xl transition-all focus:outline-none focus:ring-2"
          style={{
            background: '#18181B',
            border: '1px solid #27272A',
            color: '#FFFFFF',
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
          }}
          data-testid="activity-search-input"
        />

        {/* Clear button */}
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity"
            style={{ color: '#71717A' }}
            aria-label="Clear search"
            data-testid="clear-search-button"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Search hint */}
      {searchQuery && (
        <div
          className="mt-2 text-xs"
          style={{
            fontFamily: "'Inter', sans-serif",
            color: '#71717A',
          }}
        >
          Searching for: <span style={{ color: '#CCFF00' }}>{searchQuery}</span>
        </div>
      )}
    </div>
  );
}
