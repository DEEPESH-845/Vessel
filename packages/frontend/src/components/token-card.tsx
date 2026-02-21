/**
 * TokenCard Component
 * Displays individual token with icon, balance, USD value, price change, and quick actions
 * Requirements: FR-11.4
 */

"use client";

import { motion } from "framer-motion";
import { UnifiedAsset, TokenMetadata } from "@/types/multi-chain.types";
import { useState } from "react";

interface TokenCardProps {
  asset: UnifiedAsset;
  onSend?: (asset: UnifiedAsset) => void;
  onSwap?: (asset: UnifiedAsset) => void;
}

export default function TokenCard({ asset, onSend, onSwap }: TokenCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const metadata = asset.metadata as TokenMetadata;

  // Format balance for display
  const formatBalance = (balance: string, decimals: number) => {
    const num = parseFloat(balance) / Math.pow(10, decimals);
    if (num === 0) return "0";
    if (num < 0.01) return "< 0.01";
    if (num < 1) return num.toFixed(4);
    if (num < 1000) return num.toFixed(2);
    if (num < 1000000) return `${(num / 1000).toFixed(2)}K`;
    return `${(num / 1000000).toFixed(2)}M`;
  };

  // Format USD value
  const formatUSD = (value: string) => {
    const num = parseFloat(value);
    if (num === 0) return "$0.00";
    if (num < 0.01) return "< $0.01";
    if (num < 1000) return `$${num.toFixed(2)}`;
    if (num < 1000000) return `$${(num / 1000).toFixed(2)}K`;
    return `$${(num / 1000000).toFixed(2)}M`;
  };

  // Format price change
  const formatPriceChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  };

  // Determine price change color
  const priceChangeColor = metadata.priceChange24h >= 0 ? "#10B981" : "#EF4444";

  const balance = formatBalance(metadata.balance, metadata.decimals);
  const usdValue = formatUSD(asset.value);
  const priceChange = formatPriceChange(metadata.priceChange24h);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="p-4 rounded-xl cursor-pointer transition-all"
      style={{
        background: "#18181B",
        border: `1px solid ${isHovered ? "#CCFF00" : "#27272A"}`,
      }}
    >
      <div className="flex items-start justify-between">
        {/* Left: Token info */}
        <div className="flex items-start gap-3 flex-1">
          {/* Token icon */}
          <div className="relative">
            {metadata.logo ? (
              <img
                src={metadata.logo}
                alt={metadata.symbol}
                className="w-10 h-10 rounded-full"
                onError={(e) => {
                  // Fallback to placeholder on error
                  e.currentTarget.src = `https://via.placeholder.com/40/CCFF00/0A0A0A?text=${metadata.symbol.charAt(0)}`;
                }}
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                style={{ background: "#CCFF00", color: "#0A0A0A" }}
              >
                {metadata.symbol.charAt(0)}
              </div>
            )}
            {/* Chain badge */}
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
              style={{ background: "#0A0A0A", border: "1px solid #27272A" }}
              title={asset.chain}
            >
              {getChainIcon(asset.chainId)}
            </div>
          </div>

          {/* Token details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white truncate">{metadata.symbol}</h3>
              <span className="text-xs text-gray-400 truncate">{metadata.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">{balance}</span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-sm font-medium text-white">{usdValue}</span>
            </div>
          </div>
        </div>

        {/* Right: Price change and sparkline */}
        <div className="flex flex-col items-end gap-2 ml-4">
          {/* Price change */}
          <div
            className="px-2 py-1 rounded text-xs font-medium"
            style={{
              background: `${priceChangeColor}20`,
              color: priceChangeColor,
            }}
          >
            {priceChange}
          </div>

          {/* Sparkline placeholder */}
          <div className="w-20 h-8">
            <Sparkline priceChange={metadata.priceChange24h} />
          </div>
        </div>
      </div>

      {/* Quick actions (shown on hover) */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="flex gap-2 mt-4 pt-4"
          style={{ borderTop: "1px solid #27272A" }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSend?.(asset);
            }}
            className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: "#CCFF00",
              color: "#0A0A0A",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#B8E600";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#CCFF00";
            }}
          >
            Send
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSwap?.(asset);
            }}
            className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: "#27272A",
              color: "#FFFFFF",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#3F3F46";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#27272A";
            }}
          >
            Swap
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Sparkline Component
 * Simple line chart showing price trend
 */
function Sparkline({ priceChange }: { priceChange: number }) {
  const color = priceChange >= 0 ? "#10B981" : "#EF4444";

  // Generate simple sparkline path
  const generatePath = () => {
    const points = 10;
    const width = 80;
    const height = 32;
    const trend = priceChange >= 0 ? 1 : -1;

    // Generate random-ish points with trend
    const values = Array.from({ length: points }, (_, i) => {
      const base = 0.5 + (trend * i * 0.05);
      const noise = Math.sin(i * 0.5) * 0.1;
      return Math.max(0.1, Math.min(0.9, base + noise));
    });

    // Create SVG path
    const pathData = values
      .map((value, i) => {
        const x = (i / (points - 1)) * width;
        const y = height - value * height;
        return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      })
      .join(" ");

    return pathData;
  };

  return (
    <svg width="80" height="32" viewBox="0 0 80 32" fill="none">
      <path
        d={generatePath()}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * Get chain icon/emoji
 */
function getChainIcon(chainId: number): string {
  const chainIcons: Record<number, string> = {
    1: "Ξ", // Ethereum
    137: "◆", // Polygon
    42161: "◇", // Arbitrum
    8453: "◉", // Base
  };
  return chainIcons[chainId] || "?";
}
