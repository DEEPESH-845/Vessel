"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { MiniLineChart } from "../shared/MiniLineChart";

interface TVLCardProps {
  label: string;
  value: string;
  change: number;
  data?: number[];
  className?: string;
}

/**
 * TVLCard — Bottom-left card showing TVL/Volume metrics
 * 
 * Sparkline chart
 * Value with change percentage
 * Trend indicator
 */
export function TVLCard({ label, value, change, data = [30, 45, 35, 50, 40, 60, 55, 70], className }: TVLCardProps) {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={`p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>
        <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-[var(--color-green-pos)]' : 'text-[var(--color-red-neg)]'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{isPositive ? '+' : ''}{change.toFixed(2)}%</span>
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <span className="text-xl font-mono font-bold text-[var(--color-text-value)]">{value}</span>
        </div>
        <MiniLineChart data={data} width={80} height={32} />
      </div>
    </motion.div>
  );
}
