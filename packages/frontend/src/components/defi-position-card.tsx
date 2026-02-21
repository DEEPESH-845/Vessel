/**
 * DeFiPositionCard Component
 * Displays individual DeFi position with protocol info, deposited amount, APY, and rewards
 * Requirements: FR-11.6
 */

"use client";

import { motion } from "framer-motion";
import { UnifiedAsset, DeFiMetadata } from "@/types/multi-chain.types";

interface DeFiPositionCardProps {
  position: UnifiedAsset;
  onClaim?: (position: UnifiedAsset) => void;
  onViewProtocol?: (position: UnifiedAsset) => void;
}

export default function DeFiPositionCard({
  position,
  onClaim,
  onViewProtocol,
}: DeFiPositionCardProps) {
  const metadata = position.metadata as DeFiMetadata;
  const hasClaimableRewards = metadata.claimable && parseFloat(metadata.claimable) > 0;

  // Get protocol logo URL (placeholder for now)
  const getProtocolLogo = (protocol: string) => {
    const logos: Record<string, string> = {
      aave: "/protocols/aave.svg",
      compound: "/protocols/compound.svg",
      uniswap: "/protocols/uniswap.svg",
      curve: "/protocols/curve.svg",
    };
    return logos[protocol.toLowerCase()] || "/protocols/default.svg";
  };

  // Get position type badge color
  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      lending: "#3B82F6",
      staking: "#8B5CF6",
      liquidity: "#10B981",
      farming: "#F59E0B",
    };
    return colors[type] || "#71717A";
  };

  // Format currency values
  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    }
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(2)}K`;
    }
    return `$${num.toFixed(2)}`;
  };

  // Calculate profit/loss
  const currentValue = parseFloat(position.value);
  const depositedValue = parseFloat(metadata.deposited);
  const profitLoss = currentValue - depositedValue;
  const profitLossPercent = depositedValue > 0 ? (profitLoss / depositedValue) * 100 : 0;
  const isProfit = profitLoss >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="p-4 rounded-xl cursor-pointer"
      style={{
        background: "#18181B",
        border: "1px solid #27272A",
      }}
    >
      {/* Header: Protocol Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Protocol Logo */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "#27272A" }}
          >
            <span className="text-xl font-bold" style={{ color: "#CCFF00" }}>
              {metadata.protocol.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Protocol Name & Type */}
          <div>
            <h3 className="text-base font-semibold" style={{ color: "#FFFFFF" }}>
              {metadata.protocol}
            </h3>
            <span
              className="text-xs px-2 py-0.5 rounded-full inline-block mt-1"
              style={{
                background: `${getTypeBadgeColor(metadata.type)}20`,
                color: getTypeBadgeColor(metadata.type),
              }}
            >
              {metadata.type.charAt(0).toUpperCase() + metadata.type.slice(1)}
            </span>
          </div>
        </div>

        {/* Chain Badge */}
        <div
          className="px-2 py-1 rounded text-xs font-medium"
          style={{
            background: "#27272A",
            color: "#A1A1AA",
          }}
        >
          {position.chain}
        </div>
      </div>

      {/* Position Details */}
      <div className="space-y-3 mb-4">
        {/* Deposited Amount */}
        <div className="flex justify-between items-center">
          <span className="text-sm" style={{ color: "#71717A" }}>
            Deposited
          </span>
          <span className="text-sm font-medium" style={{ color: "#FFFFFF" }}>
            {formatCurrency(metadata.deposited)}
          </span>
        </div>

        {/* Current Value */}
        <div className="flex justify-between items-center">
          <span className="text-sm" style={{ color: "#71717A" }}>
            Current Value
          </span>
          <div className="text-right">
            <div className="text-sm font-medium" style={{ color: "#FFFFFF" }}>
              {formatCurrency(position.value)}
            </div>
            <div
              className="text-xs"
              style={{ color: isProfit ? "#10B981" : "#EF4444" }}
            >
              {isProfit ? "+" : ""}
              {formatCurrency(profitLoss.toString())} ({profitLossPercent.toFixed(2)}%)
            </div>
          </div>
        </div>

        {/* APY */}
        <div className="flex justify-between items-center">
          <span className="text-sm" style={{ color: "#71717A" }}>
            APY
          </span>
          <span
            className="text-sm font-semibold"
            style={{ color: "#CCFF00" }}
          >
            {metadata.apy.toFixed(2)}%
          </span>
        </div>

        {/* Earned Rewards */}
        {parseFloat(metadata.earned) > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: "#71717A" }}>
              Earned Rewards
            </span>
            <span className="text-sm font-medium" style={{ color: "#10B981" }}>
              {formatCurrency(metadata.earned)}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {/* Claim Button */}
        {hasClaimableRewards && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClaim?.(position);
            }}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
            style={{
              background: "#CCFF00",
              color: "#0A0A0A",
            }}
          >
            Claim {formatCurrency(metadata.claimable!)}
          </button>
        )}

        {/* View Protocol Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewProtocol?.(position);
          }}
          className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-opacity-80"
          style={{
            background: "#27272A",
            color: "#FFFFFF",
          }}
        >
          View Protocol
        </button>
      </div>
    </motion.div>
  );
}
