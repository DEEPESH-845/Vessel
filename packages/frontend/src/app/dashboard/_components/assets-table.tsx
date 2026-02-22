"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, MoreHorizontal, ArrowRight } from "lucide-react";
import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";

// Mock asset data
const assets = [
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    price: "$45,230.50",
    change: "+2.34%",
    isPositive: true,
    holdings: "0.5421",
    value: "$24,520.50",
    icon: "₿",
    color: "#F7931A",
  },
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    price: "$2,850.20",
    change: "+1.56%",
    isPositive: true,
    holdings: "2.145",
    value: "$6,113.93",
    icon: "Ξ",
    color: "#627EEA",
  },
  {
    id: "sol",
    name: "Solana",
    symbol: "SOL",
    price: "$98.45",
    change: "-0.82%",
    isPositive: false,
    holdings: "15.5",
    value: "$1,525.98",
    icon: "◎",
    color: "#00FFA3",
  },
  {
    id: "usdc",
    name: "USD Coin",
    symbol: "USDC",
    price: "$1.00",
    change: "+0.01%",
    isPositive: true,
    holdings: "1,250.00",
    value: "$1,250.00",
    icon: "$",
    color: "#2775CA",
  },
  {
    id: "dai",
    name: "Dai",
    symbol: "DAI",
    price: "$1.00",
    change: "-0.02%",
    isPositive: false,
    holdings: "500.00",
    value: "$500.00",
    icon: "◈",
    color: "#F5AC0E",
  },
  {
    id: "link",
    name: "Chainlink",
    symbol: "LINK",
    price: "$14.25",
    change: "+3.21%",
    isPositive: true,
    holdings: "45.8",
    value: "$652.65",
    icon: "⬡",
    color: "#375BD2",
  },
];

export function AssetsTable() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <GlassCard padding="none">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h3
              className="text-lg font-semibold text-white mb-1"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Your Assets
            </h3>
            <p className="text-sm text-[#8490A8]">Manage your portfolio</p>
          </div>
          <button
            className={cn(
              "flex items-center gap-1 px-4 py-2 rounded-xl",
              "text-sm font-medium text-[#4F7CFF]",
              "hover:bg-[rgba(79,124,255,0.1)]",
              "transition-all duration-200"
            )}
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-[rgba(255,255,255,0.04)]">
                <th className="text-left px-6 py-3">
                  <span className="text-xs font-medium text-[#8490A8] uppercase tracking-wider">
                    Coin
                  </span>
                </th>
                <th className="text-right px-6 py-3">
                  <span className="text-xs font-medium text-[#8490A8] uppercase tracking-wider">
                    Price
                  </span>
                </th>
                <th className="text-right px-6 py-3">
                  <span className="text-xs font-medium text-[#8490A8] uppercase tracking-wider">
                    24h Change
                  </span>
                </th>
                <th className="text-right px-6 py-3">
                  <span className="text-xs font-medium text-[#8490A8] uppercase tracking-wider">
                    Holdings
                  </span>
                </th>
                <th className="text-right px-6 py-3">
                  <span className="text-xs font-medium text-[#8490A8] uppercase tracking-wider">
                    Value
                  </span>
                </th>
                <th className="text-right px-6 py-3">
                  <span className="text-xs font-medium text-[#8490A8] uppercase tracking-wider">
                    Action
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset, index) => (
                <motion.tr
                  key={asset.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  className={cn(
                    "border-t border-[rgba(255,255,255,0.04)]",
                    "hover:bg-[rgba(255,255,255,0.02)]",
                    "transition-colors duration-150"
                  )}
                >
                  {/* Coin */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: asset.color }}
                      >
                        {asset.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{asset.name}</p>
                        <p className="text-xs text-[#8490A8]">{asset.symbol}</p>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-medium text-white">{asset.price}</span>
                  </td>

                  {/* 24h Change */}
                  <td className="px-6 py-4 text-right">
                    <div
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-lg",
                        asset.isPositive
                          ? "bg-[rgba(34,197,94,0.1)] text-[#22C55E]"
                          : "bg-[rgba(244,63,94,0.1)] text-[#F43F5E]"
                      )}
                    >
                      {asset.isPositive ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span className="text-xs font-medium">{asset.change}</span>
                    </div>
                  </td>

                  {/* Holdings */}
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-white">{asset.holdings}</span>
                  </td>

                  {/* Value */}
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-white">{asset.value}</span>
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 text-right">
                    <button
                      className={cn(
                        "p-2 rounded-lg",
                        "text-[#8490A8] hover:text-white",
                        "hover:bg-[rgba(255,255,255,0.06)]",
                        "transition-all duration-200"
                      )}
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </motion.div>
  );
}
