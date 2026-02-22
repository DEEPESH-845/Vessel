"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown, ArrowUp, ArrowDown, Settings, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TokenSelector } from "../shared/TokenSelector";

/**
 * SwapPanel — Right panel for sell/buy trading
 * 
 * Buy/Sell toggle with smooth animation
 * Input fields for amount
 * Price display
 * Swap button with glow effect
 */
export function SwapPanel() {
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [fromToken, setFromToken] = useState({ ticker: "ETH", name: "Ethereum" });
  const [toToken, setToToken] = useState({ ticker: "USDC", name: "USD Coin" });
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-5"
    >
      {/* Header with Buy/Sell Toggle */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex bg-[var(--color-bg-elevated)] rounded-xl p-1">
          <motion.button
            onClick={() => setMode("buy")}
            className={cn(
              "relative px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              mode === "buy" ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]"
            )}
          >
            {mode === "buy" && (
              <motion.div
                layoutId="swap-mode"
                className="absolute inset-0 rounded-lg bg-[var(--color-green-pos)]"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">Buy</span>
          </motion.button>
          <motion.button
            onClick={() => setMode("sell")}
            className={cn(
              "relative px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              mode === "sell" ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]"
            )}
          >
            {mode === "sell" && (
              <motion.div
                layoutId="swap-mode"
                className="absolute inset-0 rounded-lg bg-[var(--color-red-neg)]"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">Sell</span>
          </motion.button>
        </div>

        <button className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-all">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* From Token */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--color-text-secondary)]">You pay</span>
          <span className="text-xs text-[var(--color-text-muted)]">Balance: 2.45 ETH</span>
        </div>
        
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
          <TokenSelector 
            ticker={fromToken.ticker} 
            name={fromToken.name}
            showChevron={false}
            onClick={() => {}}
          />
          
          <div className="flex-1">
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent text-xl font-mono font-bold text-[var(--color-text-value)] outline-none placeholder:text-[var(--color-text-muted)]"
            />
            <span className="text-xs text-[var(--color-text-secondary)]">≈ $0.00</span>
          </div>
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center -my-3 relative z-10">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] hover:border-[var(--color-accent-blue)] transition-all"
        >
          <ArrowUpDown className="w-4 h-4 text-[var(--color-accent-cyan)]" />
        </motion.button>
      </div>

      {/* To Token */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--color-text-secondary)]">You receive</span>
          <span className="text-xs text-[var(--color-text-muted)]">Balance: 1,250 USDC</span>
        </div>
        
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
          <TokenSelector 
            ticker={toToken.ticker} 
            name={toToken.name}
            showChevron={false}
            onClick={() => {}}
          />
          
          <div className="flex-1">
            <input
              type="number"
              value={toAmount}
              onChange={(e) => setToAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent text-xl font-mono font-bold text-[var(--color-text-value)] outline-none placeholder:text-[var(--color-text-muted)]"
            />
            <span className="text-xs text-[var(--color-text-secondary)]">≈ $0.00</span>
          </div>
        </div>
      </div>

      {/* Exchange Rate */}
      <div className="mt-4 p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-text-secondary)]">Rate</span>
          <span className="font-mono text-[var(--color-text-primary)]">1 ETH = 3,245.67 USDC</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-[var(--color-text-secondary)]">Fee</span>
          <span className="font-mono text-[var(--color-text-primary)]">0.3%</span>
        </div>
      </div>

      {/* Action Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "w-full mt-4 py-3 rounded-xl font-semibold text-white transition-all",
          mode === "buy"
            ? "bg-[var(--color-green-pos)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            : "bg-[var(--color-red-neg)] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
        )}
      >
        {mode === "buy" ? "Buy ETH" : "Sell ETH"}
      </motion.button>
    </motion.div>
  );
}
