'use client';

/**
 * TVLCard - TVL display with sparkline
 * Bottom-left card showing Uniswap TVL
 */

import { ArrowUpRight } from 'lucide-react';

interface TVLCardProps {
  className?: string;
}

export function TVLCard({ className = '' }: TVLCardProps) {
  return (
    <div
      className={`absolute bottom-8 left-8 z-10 ${className}`}
      style={{
        width: '220px',
        background: 'rgba(11, 20, 34, 0.82)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(59, 130, 246, 0.12)',
        borderRadius: '20px',
        padding: '16px',
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-[#6b7fa3] uppercase tracking-wider">Uniswap TVL</span>
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: '#3b82f6' }}
        >
          <ArrowUpRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Value */}
      <div className="text-2xl font-mono font-bold text-white mb-3">$3.08B</div>

      {/* Sparkline SVG */}
      <svg viewBox="0 0 180 50" className="w-full h-12">
        <defs>
          <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path
          d="M0,40 Q20,35 40,30 T80,20 T120,25 T160,15 T180,10"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1.5"
        />
        <path
          d="M0,40 Q20,35 40,30 T80,20 T120,25 T160,15 T180,10 V50 H0 Z"
          fill="url(#sparklineGradient)"
        />
      </svg>
    </div>
  );
}