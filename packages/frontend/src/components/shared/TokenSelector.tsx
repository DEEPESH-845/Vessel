"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TokenSelectorProps {
  ticker: string;
  icon?: React.ReactNode;
  name?: string;
  showChevron?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * TokenSelector — Circular token icon + ticker
 * 
 * Outer ring: 48px circle, dark background
 * Inner icon: SVG or image of the coin
 * Ticker label below: 12px mono, text-secondary
 * Animated chevron if dropdown
 */
export function TokenSelector({
  ticker,
  icon,
  name,
  showChevron = true,
  onClick,
  className,
}: TokenSelectorProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex flex-col items-center gap-1.5",
        "bg-[var(--color-bg-elevated)] rounded-2xl",
        "border border-[var(--color-border-subtle)]",
        "p-3 transition-all duration-200",
        "hover:border-[var(--color-accent-blue)] hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]",
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Token Icon Circle */}
      <div className="relative w-12 h-12 rounded-full bg-[var(--color-bg-surface)] flex items-center justify-center overflow-hidden">
        {icon ? (
          icon
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-accent-blue)] to-[var(--color-accent-cyan)] flex items-center justify-center">
            <span className="text-white font-bold text-sm">{ticker.slice(0, 2)}</span>
          </div>
        )}
        
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200 bg-gradient-to-br from-[var(--color-accent-blue)] to-[var(--color-accent-cyan)] blur-md -z-10" />
      </div>

      {/* Ticker + Name */}
      <div className="flex flex-col items-center">
        <span className="text-xs font-mono font-medium text-[var(--color-text-value)]">
          {ticker}
        </span>
        {name && (
          <span className="text-[10px] text-[var(--color-text-muted)]">
            {name}
          </span>
        )}
      </div>

      {/* Animated Chevron */}
      {showChevron && (
        <motion.div
          animate={{ y: [0, 2, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown className="w-3 h-3 text-[var(--color-text-muted)]" />
        </motion.div>
      )}
    </motion.button>
  );
}
