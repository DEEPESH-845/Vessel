/**
 * DeFiPositionsList Component
 * Displays a list of DeFi positions with filtering and sorting
 * Requirements: FR-11.6
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import DeFiPositionCard from "./defi-position-card";
import { UnifiedAsset, DeFiMetadata } from "@/types/multi-chain.types";

interface DeFiPositionsListProps {
  positions: UnifiedAsset[];
  onClaim?: (position: UnifiedAsset) => void;
  onViewProtocol?: (position: UnifiedAsset) => void;
}

type SortOption = "value" | "apy" | "earned" | "protocol";
type FilterOption = "all" | "lending" | "staking" | "liquidity" | "farming";

export default function DeFiPositionsList({
  positions,
  onClaim,
  onViewProtocol,
}: DeFiPositionsListProps) {
  const [sortBy, setSortBy] = useState<SortOption>("value");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");

  // Filter positions
  const filteredPositions = positions.filter((position) => {
    if (filterBy === "all") return true;
    const metadata = position.metadata as DeFiMetadata;
    return metadata.type === filterBy;
  });

  // Sort positions
  const sortedPositions = [...filteredPositions].sort((a, b) => {
    const metadataA = a.metadata as DeFiMetadata;
    const metadataB = b.metadata as DeFiMetadata;

    switch (sortBy) {
      case "value":
        return parseFloat(b.value) - parseFloat(a.value);
      case "apy":
        return metadataB.apy - metadataA.apy;
      case "earned":
        return parseFloat(metadataB.earned) - parseFloat(metadataA.earned);
      case "protocol":
        return metadataA.protocol.localeCompare(metadataB.protocol);
      default:
        return 0;
    }
  });

  // Calculate total stats
  const totalValue = positions.reduce(
    (sum, pos) => sum + parseFloat(pos.value),
    0
  );
  const totalEarned = positions.reduce((sum, pos) => {
    const metadata = pos.metadata as DeFiMetadata;
    return sum + parseFloat(metadata.earned);
  }, 0);
  const avgAPY =
    positions.length > 0
      ? positions.reduce((sum, pos) => {
          const metadata = pos.metadata as DeFiMetadata;
          return sum + metadata.apy;
        }, 0) / positions.length
      : 0;

  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  if (positions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="p-12 rounded-2xl text-center"
        style={{ background: "#18181B", border: "1px solid #27272A" }}
      >
        <div className="mb-4">
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            className="mx-auto opacity-50"
          >
            <circle cx="32" cy="32" r="30" stroke="#27272A" strokeWidth="2" />
            <path
              d="M32 20v24M20 32h24"
              stroke="#CCFF00"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2" style={{ color: "#FFFFFF" }}>
          No DeFi Positions
        </h3>
        <p className="text-sm" style={{ color: "#71717A" }}>
          You don't have any active DeFi positions yet. Start earning by depositing into protocols.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-4 rounded-xl"
        style={{ background: "#18181B", border: "1px solid #27272A" }}
      >
        <h2 className="text-xl font-semibold mb-4" style={{ color: "#FFFFFF" }}>
          DeFi Positions
        </h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs mb-1" style={{ color: "#71717A" }}>
              Total Value
            </p>
            <p className="text-lg font-semibold" style={{ color: "#FFFFFF" }}>
              {formatCurrency(totalValue)}
            </p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: "#71717A" }}>
              Total Earned
            </p>
            <p className="text-lg font-semibold" style={{ color: "#10B981" }}>
              {formatCurrency(totalEarned)}
            </p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: "#71717A" }}>
              Avg APY
            </p>
            <p className="text-lg font-semibold" style={{ color: "#CCFF00" }}>
              {avgAPY.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap gap-2">
          {/* Filter Buttons */}
          <div className="flex gap-2">
            {(["all", "lending", "staking", "liquidity", "farming"] as FilterOption[]).map(
              (filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterBy(filter)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: filterBy === filter ? "#CCFF00" : "#27272A",
                    color: filterBy === filter ? "#0A0A0A" : "#A1A1AA",
                  }}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              )
            )}
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium outline-none"
            style={{
              background: "#27272A",
              color: "#A1A1AA",
              border: "1px solid #27272A",
            }}
          >
            <option value="value">Sort by Value</option>
            <option value="apy">Sort by APY</option>
            <option value="earned">Sort by Earned</option>
            <option value="protocol">Sort by Protocol</option>
          </select>
        </div>
      </motion.div>

      {/* Positions Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {sortedPositions.map((position, index) => (
          <motion.div
            key={`${position.chain}-${(position.metadata as DeFiMetadata).protocol}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <DeFiPositionCard
              position={position}
              onClaim={onClaim}
              onViewProtocol={onViewProtocol}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* No Results Message */}
      {sortedPositions.length === 0 && filteredPositions.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8 rounded-xl text-center"
          style={{ background: "#18181B", border: "1px solid #27272A" }}
        >
          <p className="text-sm" style={{ color: "#71717A" }}>
            No positions found for the selected filter.
          </p>
        </motion.div>
      )}
    </div>
  );
}
