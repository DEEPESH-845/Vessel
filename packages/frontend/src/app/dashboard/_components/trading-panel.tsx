"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import * as Tabs from "@radix-ui/react-tabs";
import { ArrowUpDown, ChevronDown, Wallet } from "lucide-react";
import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";

// Mock coin options
const coins = [
  { symbol: "BTC", name: "Bitcoin", icon: "₿", color: "#F7931A" },
  { symbol: "ETH", name: "Ethereum", icon: "Ξ", color: "#627EEA" },
  { symbol: "SOL", name: "Solana", icon: "◎", color: "#00FFA3" },
  { symbol: "USDC", name: "USD Coin", icon: "$", color: "#2775CA" },
];

export function TradingPanel() {
  const [activeTab, setActiveTab] = useState("buy");
  const [selectedCoin, setSelectedCoin] = useState(coins[0]);
  const [amount, setAmount] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="h-full"
    >
      <GlassCard className="h-full">
        {/* Header */}
        <div className="mb-6">
          <h3
            className="text-lg font-semibold text-white mb-1"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Quick Trade
          </h3>
          <p className="text-sm text-[#8490A8]">Buy or sell instantly</p>
        </div>

        {/* Tabs */}
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List className="flex gap-1 p-1 rounded-xl bg-[rgba(255,255,255,0.04)] mb-6">
            <Tabs.Trigger
              value="buy"
              className={cn(
                "flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
                activeTab === "buy"
                  ? "bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white"
                  : "text-[#8490A8] hover:text-white"
              )}
            >
              Buy
            </Tabs.Trigger>
            <Tabs.Trigger
              value="sell"
              className={cn(
                "flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
                activeTab === "sell"
                  ? "bg-gradient-to-r from-[#F43F5E] to-[#E11D48] text-white"
                  : "text-[#8490A8] hover:text-white"
              )}
            >
              Sell
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="buy" className="outline-none">
            <div className="space-y-4">
              {/* Amount Input */}
              <div>
                <label className="block text-sm text-[#8490A8] mb-2">Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={cn(
                      "w-full h-12 pl-4 pr-20 rounded-xl",
                      "bg-[rgba(255,255,255,0.04)]",
                      "border border-[rgba(255,255,255,0.06)]",
                      "text-lg text-white placeholder:text-[#8490A8]",
                      "focus:outline-none focus:border-[rgba(79,124,255,0.4)]",
                      "transition-all duration-200"
                    )}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#8490A8]">
                    USD
                  </span>
                </div>
              </div>

              {/* Coin Selector */}
              <div>
                <label className="block text-sm text-[#8490A8] mb-2">Asset</label>
                <div className="relative">
                  <button
                    className={cn(
                      "w-full h-12 px-4 rounded-xl",
                      "bg-[rgba(255,255,255,0.04)]",
                      "border border-[rgba(255,255,255,0.06)]",
                      "flex items-center justify-between",
                      "hover:border-[rgba(79,124,255,0.4)]",
                      "transition-all duration-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: selectedCoin.color }}
                      >
                        {selectedCoin.icon}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-white">{selectedCoin.symbol}</p>
                        <p className="text-xs text-[#8490A8]">{selectedCoin.name}</p>
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-[#8490A8]" />
                  </button>
                </div>
              </div>

              {/* Balance */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.02)]">
                <div className="flex items-center gap-2 text-[#8490A8]">
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm">Available Balance</span>
                </div>
                <span className="text-sm font-medium text-white">$24,582.50</span>
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full h-12 rounded-xl",
                  "bg-gradient-to-r from-[#22C55E] to-[#16A34A]",
                  "text-white font-semibold",
                  "flex items-center justify-center gap-2",
                  "shadow-[0_4px_20px_rgba(34,197,94,0.3)]",
                  "hover:shadow-[0_6px_30px_rgba(34,197,94,0.4)]",
                  "transition-all duration-200"
                )}
              >
                <ArrowUpDown className="w-4 h-4" />
                Buy {selectedCoin.symbol}
              </motion.button>
            </div>
          </Tabs.Content>

          <Tabs.Content value="sell" className="outline-none">
            <div className="space-y-4">
              {/* Amount Input */}
              <div>
                <label className="block text-sm text-[#8490A8] mb-2">Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={cn(
                      "w-full h-12 pl-4 pr-20 rounded-xl",
                      "bg-[rgba(255,255,255,0.04)]",
                      "border border-[rgba(255,255,255,0.06)]",
                      "text-lg text-white placeholder:text-[#8490A8]",
                      "focus:outline-none focus:border-[rgba(79,124,255,0.4)]",
                      "transition-all duration-200"
                    )}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#8490A8]">
                    USD
                  </span>
                </div>
              </div>

              {/* Coin Selector */}
              <div>
                <label className="block text-sm text-[#8490A8] mb-2">Asset</label>
                <div className="relative">
                  <button
                    className={cn(
                      "w-full h-12 px-4 rounded-xl",
                      "bg-[rgba(255,255,255,0.04)]",
                      "border border-[rgba(255,255,255,0.06)]",
                      "flex items-center justify-between",
                      "hover:border-[rgba(79,124,255,0.4)]",
                      "transition-all duration-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: selectedCoin.color }}
                      >
                        {selectedCoin.icon}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-white">{selectedCoin.symbol}</p>
                        <p className="text-xs text-[#8490A8]">{selectedCoin.name}</p>
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-[#8490A8]" />
                  </button>
                </div>
              </div>

              {/* Balance */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.02)]">
                <div className="flex items-center gap-2 text-[#8490A8]">
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm">Available Balance</span>
                </div>
                <span className="text-sm font-medium text-white">$24,582.50</span>
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full h-12 rounded-xl",
                  "bg-gradient-to-r from-[#F43F5E] to-[#E11D48]",
                  "text-white font-semibold",
                  "flex items-center justify-center gap-2",
                  "shadow-[0_4px_20px_rgba(244,63,94,0.3)]",
                  "hover:shadow-[0_6px_30px_rgba(244,63,94,0.4)]",
                  "transition-all duration-200"
                )}
              >
                <ArrowUpDown className="w-4 h-4" />
                Sell {selectedCoin.symbol}
              </motion.button>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </GlassCard>
    </motion.div>
  );
}
