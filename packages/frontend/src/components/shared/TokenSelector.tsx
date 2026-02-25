'use client';

/**
 * TokenSelector - Circular token icon + ticker
 * 48px outer ring with dropdown chevron
 */

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface TokenSelectorProps {
  symbol: string;
  icon?: React.ReactNode;
  onToggle?: () => void;
  isOpen?: boolean;
  className?: string;
}

const tokenIcons: Record<string, { color: string; bgColor: string }> = {
  BTC: { color: '#F7931A', bgColor: '#F7931A20' },
  ETH: { color: '#627EEA', bgColor: '#627EEA20' },
  USDT: { color: '#26A17B', bgColor: '#26A17B20' },
  BNB: { color: '#F3BA2F', bgColor: '#F3BA2F20' },
  SOL: { color: '#9945FF', bgColor: '#9945FF20' },
};

export function TokenSelector({
  symbol,
  icon,
  onToggle,
  isOpen = false,
  className = '',
}: TokenSelectorProps) {
  const tokenStyle = tokenIcons[symbol] || { color: '#6b7fa3', bgColor: '#6b7fa320' };
  
  return (
    <button
      onClick={onToggle}
      className={`flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/5 transition-colors ${className}`}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
        style={{ backgroundColor: tokenStyle.bgColor, color: tokenStyle.color }}
      >
        {icon || symbol.charAt(0)}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs font-mono text-[#6b7fa3]">{symbol}</span>
        {onToggle && (
          isOpen ? 
            <ChevronUp className="w-3 h-3 text-[#6b7fa3]" /> : 
            <ChevronDown className="w-3 h-3 text-[#6b7fa3]" />
        )}
      </div>
    </button>
  );
}