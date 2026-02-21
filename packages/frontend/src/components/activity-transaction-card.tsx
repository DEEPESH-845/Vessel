/**
 * ActivityTransactionCard Component
 * 
 * Displays a transaction card with expand/collapse functionality to show
 * detailed information including gas costs, block numbers, and explorer links.
 * 
 * Requirements: FR-1.1, FR-1.4
 */

'use client';

import React, { useState } from 'react';
import { ActivityTransaction } from '@/types/transaction.types';
import { ChevronDown, ChevronUp, Copy, ExternalLink } from 'lucide-react';

export interface ActivityTransactionCardProps {
  transaction: ActivityTransaction;
  searchQuery?: string;
}

// Chain configuration for badges and explorer links
const CHAIN_CONFIG: Record<number, { name: string; color: string; explorer: string }> = {
  1: { name: 'Ethereum', color: '#627EEA', explorer: 'https://etherscan.io' },
  137: { name: 'Polygon', color: '#8247E5', explorer: 'https://polygonscan.com' },
  42161: { name: 'Arbitrum', color: '#28A0F0', explorer: 'https://arbiscan.io' },
  8453: { name: 'Base', color: '#0052FF', explorer: 'https://basescan.org' },
};

// Transaction type icons and labels
const TRANSACTION_TYPES: Record<string, { label: string; icon: string }> = {
  send: { label: 'Send', icon: '↑' },
  receive: { label: 'Receive', icon: '↓' },
  swap: { label: 'Swap', icon: '⇄' },
  bridge: { label: 'Bridge', icon: '⟷' },
  contract: { label: 'Contract', icon: '⚙' },
};

export default function ActivityTransactionCard({ transaction, searchQuery = '' }: ActivityTransactionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const chainConfig = CHAIN_CONFIG[transaction.chainId] || {
    name: transaction.chain || 'Unknown',
    color: '#71717A',
    explorer: '',
  };

  const typeConfig = TRANSACTION_TYPES[transaction.type] || {
    label: transaction.type,
    icon: '•',
  };

  // Format address for display (0x1234...5678) with optional highlighting
  const formatAddress = (address: string, highlight: boolean = false) => {
    if (!address || address.length < 10) return address;
    const formatted = `${address.slice(0, 6)}...${address.slice(-4)}`;
    
    if (highlight && searchQuery) {
      const lowerAddress = address.toLowerCase();
      const lowerQuery = searchQuery.toLowerCase();
      if (lowerAddress.includes(lowerQuery)) {
        return `<span style="background: #CCFF0030; color: #CCFF00; padding: 0 2px; border-radius: 2px;">${formatted}</span>`;
      }
    }
    
    return formatted;
  };

  // Highlight text if it matches search query
  const highlightText = (text: string) => {
    if (!searchQuery) return text;
    
    const lowerText = text.toLowerCase();
    const lowerQuery = searchQuery.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);
    
    if (index === -1) return text;
    
    const before = text.slice(0, index);
    const match = text.slice(index, index + searchQuery.length);
    const after = text.slice(index + searchQuery.length);
    
    return `${before}<span style="background: #CCFF0030; color: #CCFF00; padding: 0 2px; border-radius: 2px;">${match}</span>${after}`;
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#CCFF00';
      case 'confirming':
        return '#FFA500';
      case 'pending':
        return '#FFA500';
      case 'failed':
        return '#FF4444';
      default:
        return '#71717A';
    }
  };

  return (
    <div
      className="relative overflow-hidden transition-all duration-200"
      style={{
        background: '#18181B',
        border: '1px solid #27272A',
        borderRadius: '20px',
      }}
    >
      {/* Main card content - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left hover:bg-opacity-80 transition-colors"
        style={{ background: 'transparent' }}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Left side: Type icon, chain badge, and addresses */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {/* Transaction type icon */}
              <div
                className="flex items-center justify-center"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#27272A',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '16px',
                  color: '#CCFF00',
                }}
              >
                {typeConfig.icon}
              </div>

              {/* Chain badge */}
              <div
                className="px-2 py-1 rounded-lg text-xs font-medium"
                style={{
                  background: `${chainConfig.color}20`,
                  color: chainConfig.color,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {chainConfig.name}
              </div>

              {/* Transaction type label */}
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  color: '#A1A1AA',
                }}
              >
                {typeConfig.label}
              </span>
            </div>

            {/* From/To addresses */}
            <div
              className="text-sm"
              style={{
                fontFamily: "'Inter', sans-serif",
                color: '#FFFFFF',
              }}
            >
              <span style={{ color: '#A1A1AA' }}>From: </span>
              <span dangerouslySetInnerHTML={{ __html: formatAddress(transaction.from, true) }} />
              <span style={{ color: '#A1A1AA', margin: '0 8px' }}>→</span>
              <span style={{ color: '#A1A1AA' }}>To: </span>
              <span dangerouslySetInnerHTML={{ __html: formatAddress(transaction.to, true) }} />
            </div>

            {/* Timestamp */}
            <p
              className="mt-1 text-xs"
              style={{
                fontFamily: "'Inter', sans-serif",
                color: '#71717A',
              }}
            >
              {formatTimestamp(transaction.timestamp)}
            </p>
          </div>

          {/* Right side: Amount and status */}
          <div className="flex flex-col items-end">
            {/* Amount */}
            <p
              className="font-bold"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '16px',
                color: '#FFFFFF',
              }}
            >
              {transaction.value} {transaction.token || 'ETH'}
            </p>

            {/* Status */}
            <div className="flex items-center gap-1.5 mt-1">
              <div
                className="rounded-full"
                style={{
                  width: '6px',
                  height: '6px',
                  backgroundColor: getStatusColor(transaction.status),
                }}
              />
              <span
                className="text-xs capitalize"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  color: getStatusColor(transaction.status),
                  fontWeight: 500,
                }}
              >
                {transaction.status}
              </span>
            </div>

            {/* Expand/collapse icon */}
            <div className="mt-2" style={{ color: '#A1A1AA' }}>
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </div>
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div
          className="px-4 pb-4 pt-2 border-t"
          style={{
            borderColor: '#27272A',
          }}
        >
          {/* Transaction hash */}
          <div className="mb-3">
            <p
              className="text-xs mb-1"
              style={{
                fontFamily: "'Inter', sans-serif",
                color: '#71717A',
              }}
            >
              Transaction Hash
            </p>
            <div className="flex items-center gap-2">
              <code
                className="flex-1 text-sm"
                style={{
                  fontFamily: "'Courier New', monospace",
                  color: '#FFFFFF',
                  wordBreak: 'break-all',
                }}
                dangerouslySetInnerHTML={{ __html: highlightText(transaction.hash) }}
              />
              <button
                onClick={() => copyToClipboard(transaction.hash, 'hash')}
                className="p-1 hover:bg-opacity-80 transition-colors"
                style={{ color: copiedField === 'hash' ? '#CCFF00' : '#A1A1AA' }}
              >
                <Copy size={16} />
              </button>
            </div>
          </div>

          {/* Block number and confirmations */}
          {transaction.blockNumber && (
            <div className="mb-3">
              <p
                className="text-xs mb-1"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  color: '#71717A',
                }}
              >
                Block Number
              </p>
              <p
                className="text-sm"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  color: '#FFFFFF',
                }}
              >
                {transaction.blockNumber.toLocaleString()}
              </p>
            </div>
          )}

          {/* Gas information */}
          {transaction.gasUsed && (
            <div className="mb-3">
              <p
                className="text-xs mb-1"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  color: '#71717A',
                }}
              >
                Gas Used
              </p>
              <div
                className="text-sm"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  color: '#FFFFFF',
                }}
              >
                {transaction.gasUsed}
                {transaction.gasCostUSD && (
                  <span style={{ color: '#A1A1AA', marginLeft: '8px' }}>
                    (${transaction.gasCostUSD})
                  </span>
                )}
                {transaction.gasPaidIn && (
                  <span
                    className="ml-2 px-2 py-0.5 rounded text-xs"
                    style={{
                      background: '#CCFF0020',
                      color: '#CCFF00',
                    }}
                  >
                    Paid in {transaction.gasPaidIn}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Full addresses */}
          <div className="mb-3">
            <p
              className="text-xs mb-1"
              style={{
                fontFamily: "'Inter', sans-serif",
                color: '#71717A',
              }}
            >
              From Address
            </p>
            <div className="flex items-center gap-2">
              <code
                className="flex-1 text-xs"
                style={{
                  fontFamily: "'Courier New', monospace",
                  color: '#FFFFFF',
                  wordBreak: 'break-all',
                }}
                dangerouslySetInnerHTML={{ __html: highlightText(transaction.from) }}
              />
              <button
                onClick={() => copyToClipboard(transaction.from, 'from')}
                className="p-1 hover:bg-opacity-80 transition-colors"
                style={{ color: copiedField === 'from' ? '#CCFF00' : '#A1A1AA' }}
              >
                <Copy size={14} />
              </button>
            </div>
          </div>

          <div className="mb-3">
            <p
              className="text-xs mb-1"
              style={{
                fontFamily: "'Inter', sans-serif",
                color: '#71717A',
              }}
            >
              To Address
            </p>
            <div className="flex items-center gap-2">
              <code
                className="flex-1 text-xs"
                style={{
                  fontFamily: "'Courier New', monospace",
                  color: '#FFFFFF',
                  wordBreak: 'break-all',
                }}
                dangerouslySetInnerHTML={{ __html: highlightText(transaction.to) }}
              />
              <button
                onClick={() => copyToClipboard(transaction.to, 'to')}
                className="p-1 hover:bg-opacity-80 transition-colors"
                style={{ color: copiedField === 'to' ? '#CCFF00' : '#A1A1AA' }}
              >
                <Copy size={14} />
              </button>
            </div>
          </div>

          {/* Block explorer link */}
          {chainConfig.explorer && (
            <a
              href={`${chainConfig.explorer}/tx/${transaction.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 mt-4 px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors"
              style={{
                background: '#27272A',
                color: '#CCFF00',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              <span>View on {chainConfig.name} Explorer</span>
              <ExternalLink size={16} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
