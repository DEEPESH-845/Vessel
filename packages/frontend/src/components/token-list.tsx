/**
 * TokenList Component
 * Displays list of tokens with sorting options
 * Requirements: FR-11.4
 */

"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UnifiedAsset, TokenMetadata } from "@/types/multi-chain.types";
import TokenCard from "./token-card";

type SortOption = "value" | "name" | "change";

interface TokenListProps {
  tokens: UnifiedAsset[];
  onSend?: (asset: UnifiedAsset) => void;
  onSwap?: (asset: UnifiedAsset) => void;
}

export default function TokenList({ tokens, onSend, onSwap }: TokenListProps) {
  const [sortBy, setSortBy] = useState<SortOption>("value");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Filter only token assets
  const tokenAssets = useMemo(() => {
    return tokens.filter((asset) => asset.type === "token");
  }, [tokens]);

  // Sort tokens
  const sortedTokens = useMemo(() => {
    const sorted = [...tokenAssets].sort((a, b) => {
      const metadataA = a.metadata as TokenMetadata;
      const metadataB = b.metadata as TokenMetadata;

      let comparison = 0;

      switch (sortBy) {
        case "value":
          comparison = parseFloat(a.value) - parseFloat(b.value);
          break;
        case "name":
          comparison = metadataA.symbol.localeCompare(metadataB.symbol);
          break;
        case "change":
          comparison = metadataA.priceChange24h - metadataB.priceChange24h;
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [tokenAssets, sortBy, sortDirection]);

  // Handle sort change
  const handleSortChange = (option: SortOption) => {
    if (sortBy === option) {
      // Toggle direction if same option
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new option with default direction
      setSortBy(option);
      setSortDirection(option === "name" ? "asc" : "desc");
    }
  };

  // Empty state
  if (tokenAssets.length === 0) {
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
            <circle cx="32" cy="32" r="12" stroke="#CCFF00" strokeWidth="2" />
            <path
              d="M32 20v24M20 32h24"
              stroke="#27272A"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2" style={{ color: "#FFFFFF" }}>
          No Tokens Found
        </h3>
        <p className="text-sm" style={{ color: "#71717A" }}>
          You don't have any tokens in your wallet yet.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with sorting options */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Tokens ({tokenAssets.length})
        </h2>

        {/* Sort options */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Sort by:</span>
          <div className="flex gap-1">
            <SortButton
              label="Value"
              active={sortBy === "value"}
              direction={sortBy === "value" ? sortDirection : undefined}
              onClick={() => handleSortChange("value")}
            />
            <SortButton
              label="Name"
              active={sortBy === "name"}
              direction={sortBy === "name" ? sortDirection : undefined}
              onClick={() => handleSortChange("name")}
            />
            <SortButton
              label="Change"
              active={sortBy === "change"}
              direction={sortBy === "change" ? sortDirection : undefined}
              onClick={() => handleSortChange("change")}
            />
          </div>
        </div>
      </div>

      {/* Token list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {sortedTokens.map((token) => (
            <motion.div
              key={`${token.chainId}-${(token.metadata as TokenMetadata).address}`}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <TokenCard asset={token} onSend={onSend} onSwap={onSwap} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Sort Button Component
 */
interface SortButtonProps {
  label: string;
  active: boolean;
  direction?: "asc" | "desc";
  onClick: () => void;
}

function SortButton({ label, active, direction, onClick }: SortButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1"
      style={{
        background: active ? "#CCFF00" : "#27272A",
        color: active ? "#0A0A0A" : "#FFFFFF",
      }}
    >
      {label}
      {active && direction && (
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`transition-transform ${direction === "asc" ? "rotate-180" : ""}`}
        >
          <path
            d="M6 3L9 7H3L6 3Z"
            fill="currentColor"
          />
        </svg>
      )}
    </button>
  );
}
