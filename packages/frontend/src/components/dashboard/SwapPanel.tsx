'use client';

/**
 * SwapPanel - Right panel for swap interface
 * 300px wide with sell/buy sections
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, Lock, ChevronDown } from 'lucide-react';

interface SwapPanelProps {
  className?: string;
}

export function SwapPanel({ className = '' }: SwapPanelProps) {
  const [sellAmount, setSellAmount] = useState('0.0351289');
  const [buyAmount, setBuyAmount] = useState('0.09657039');
  const [isSwapping, setIsSwapping] = useState(false);

  const handleSwapDirection = () => {
    setIsSwapping(true);
    setTimeout(() => {
      const temp = sellAmount;
      setSellAmount(buyAmount);
      setBuyAmount(temp);
      setIsSwapping(false);
    }, 400);
  };

  return (
    <div
      className={`h-full flex flex-col ${className}`}
      style={{
        width: '300px',
        background: '#0b1422',
        borderLeft: '1px solid rgba(59, 130, 246, 0.12)',
      }}
    >
      {/* Sell Section */}
      <div className="p-4 border-b border-[rgba(59,130,246,0.12)]">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-medium text-[#6b7fa3] uppercase tracking-wider">Sell</span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F7931A20] flex items-center justify-center text-[#F7931A] font-bold text-sm">B</div>
            <span className="text-sm text-white font-medium">BTC</span>
            <ChevronDown className="w-4 h-4 text-[#6b7fa3]" />
          </div>
        </div>
        
        <div className="relative">
          <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[#6b7fa3] text-lg">|</span>
          <input
            type="text"
            value={sellAmount}
            onChange={(e) => setSellAmount(e.target.value)}
            className="w-full bg-transparent text-white font-mono text-[28px] font-bold pl-4 pr-2 outline-none"
          />
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-[#6b7fa3]">$50.32</span>
          <span className="text-xs text-[#374562]">Min: 0.00512869 BTC</span>
        </div>
        
        <div className="mt-3 flex justify-center">
          <span className="px-3 py-1 rounded-full border border-[rgba(59,130,246,0.12)] text-xs text-[#6b7fa3]">
            No extra fees
          </span>
        </div>
      </div>

      {/* Swap Direction Button */}
      <div className="relative h-0">
        <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <motion.button
            onClick={handleSwapDirection}
            animate={{ rotate: isSwapping ? 180 : 0 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            className="w-10 h-10 rounded-full bg-[#3b82f6] flex items-center justify-center text-white shadow-lg shadow-[#3b82f6]/30"
          >
            <ArrowUpDown className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Buy Section */}
      <div className="p-4 border-b border-[rgba(59,130,246,0.12)]">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-medium text-[#6b7fa3] uppercase tracking-wider">Buy</span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#627EEA20] flex items-center justify-center text-[#627EEA] font-bold text-sm">E</div>
            <span className="text-sm text-white font-medium">ETH</span>
            <ChevronDown className="w-4 h-4 text-[#6b7fa3]" />
          </div>
        </div>
        
        <div className="relative">
          <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[#6b7fa3] text-lg">~</span>
          <input
            type="text"
            value={buyAmount}
            onChange={(e) => setBuyAmount(e.target.value)}
            className="w-full bg-transparent text-white font-mono text-[28px] font-bold pl-4 pr-2 outline-none"
          />
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#6b7fa3]" />
            <span className="text-sm text-[#6b7fa3]">$47.6</span>
          </div>
          <span className="text-xs text-[#374562]">1 BTC ≈ 18.82 ETH BSC</span>
        </div>
      </div>

      {/* Floating Rate Info */}
      <div className="p-4 border-b border-[rgba(59,130,246,0.12)]">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-[#6b7fa3]">Floating</span>
            <span className="text-xs text-[#22d3ee]">0.5%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-[#6b7fa3]">Fixed</span>
            <span className="text-xs text-[#6b7fa3]">1.0%</span>
          </div>
        </div>
      </div>

      {/* Swap Button */}
      <div className="p-4 mt-auto">
        <button className="w-full py-3 rounded-xl bg-[#3b82f6] text-white font-semibold text-sm hover:bg-[#3b82f6]/90 transition-colors">
          Swap Now
        </button>
      </div>
    </div>
  );
}