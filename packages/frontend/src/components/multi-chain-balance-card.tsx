/**
 * MultiChainBalanceCard Component
 * Displays total portfolio value with animated counter and chain breakdown
 * Requirements: FR-11.2
 */

"use client";

import { motion, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

interface ChainBreakdown {
  chain: string;
  chainId: number;
  value: string;
}

interface MultiChainBalanceCardProps {
  totalValue: string;
  chainBreakdown: ChainBreakdown[];
  isLoading: boolean;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  onRefresh: () => void;
}

export default function MultiChainBalanceCard({
  totalValue,
  chainBreakdown,
  isLoading,
  isRefreshing,
  lastUpdated,
  onRefresh,
}: MultiChainBalanceCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const springValue = useSpring(0, {
    stiffness: 50,
    damping: 20,
    mass: 1,
  });

  // Animated counter effect
  useEffect(() => {
    const numericValue = parseFloat(totalValue) || 0;
    springValue.set(numericValue);
  }, [totalValue, springValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(latest);
    });
    return unsubscribe;
  }, [springValue]);

  const formattedValue = `$${displayValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        ease: [0.21, 0.47, 0.32, 0.98],
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
      whileHover={{
        scale: 1.01,
        transition: { duration: 0.2 },
      }}
      className="relative"
    >
      {/* Ambient glow effect */}
      <motion.div
        className="absolute -inset-4 rounded-3xl opacity-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(204, 255, 0, 0.08), transparent 70%)",
        }}
        animate={{
          opacity: [0, 0.3, 0],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        aria-hidden="true"
      />

      {/* Card container */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, rgba(24, 24, 27, 0.95), rgba(24, 24, 27, 0.8))",
          border: "1px solid rgba(39, 39, 42, 0.8)",
          borderRadius: "24px",
          padding: "24px",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(255, 255, 255, 0.05) inset",
        }}
      >
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(204, 255, 0, 0.03) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
          }}
          animate={{
            backgroundPosition: ["0% 0%", "200% 0%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Header with refresh button */}
          <div className="flex items-center justify-between mb-3">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex items-center gap-2"
            >
              <p
                className="text-sm"
                style={{
                  color: "#CCFF00",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  textShadow: "0 0 20px rgba(204, 255, 0, 0.3)",
                }}
              >
                Total Portfolio Value
              </p>

              {/* Live indicator */}
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{
                  background: "#CCFF00",
                  boxShadow: "0 0 8px rgba(204, 255, 0, 0.6)",
                }}
                animate={{
                  opacity: [1, 0.4, 1],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                aria-hidden="true"
              />
            </motion.div>

            {/* Refresh button */}
            <motion.button
              onClick={onRefresh}
              disabled={isRefreshing}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg transition-colors"
              style={{
                background: "rgba(204, 255, 0, 0.1)",
                border: "1px solid rgba(204, 255, 0, 0.2)",
              }}
              aria-label="Refresh balances"
            >
              <motion.svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                style={{ color: "#CCFF00" }}
                animate={isRefreshing ? { rotate: 360 } : {}}
                transition={
                  isRefreshing
                    ? { duration: 1, repeat: Infinity, ease: "linear" }
                    : {}
                }
              >
                <path
                  d="M14 8a6 6 0 1 1-1.757-4.243M14 2v4h-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            </motion.button>
          </div>

          {/* Animated total value */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="font-bold mb-6"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(32px, 6vw, 48px)",
              fontWeight: 700,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
              fontFeatureSettings: "'tnum' on, 'lnum' on",
            }}
          >
            {formattedValue}
          </motion.h2>

          {/* Chain breakdown */}
          {chainBreakdown.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-3"
            >
              <p
                className="text-xs mb-3"
                style={{
                  color: "#71717A",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Chain Breakdown
              </p>

              {chainBreakdown.map((item, index) => (
                <ChainBreakdownItem
                  key={item.chainId}
                  chain={item.chain}
                  chainId={item.chainId}
                  value={item.value}
                  totalValue={parseFloat(totalValue)}
                  index={index}
                />
              ))}
            </motion.div>
          )}

          {/* Last updated timestamp */}
          {lastUpdated && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="text-xs mt-4"
              style={{ color: "#71717A" }}
            >
              Last updated: {formatTimestamp(lastUpdated)}
            </motion.p>
          )}
        </div>

        {/* Bottom accent */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{
            background: "linear-gradient(90deg, transparent, #CCFF00, transparent)",
          }}
          animate={{
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          aria-hidden="true"
        />

        {/* Corner accent */}
        <div
          className="absolute top-0 right-0 w-24 h-24 opacity-10 pointer-events-none"
          style={{
            background: "radial-gradient(circle at top right, #CCFF00, transparent 70%)",
          }}
          aria-hidden="true"
        />
      </div>
    </motion.div>
  );
}

/**
 * Chain breakdown item component
 */
function ChainBreakdownItem({
  chain,
  chainId,
  value,
  totalValue,
  index,
}: {
  chain: string;
  chainId: number;
  value: string;
  totalValue: number;
  index: number;
}) {
  const percentage = totalValue > 0 ? (parseFloat(value) / totalValue) * 100 : 0;
  const chainInfo = getChainInfo(chainId);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
      className="flex items-center justify-between p-3 rounded-xl"
      style={{
        background: "rgba(255, 255, 255, 0.02)",
        border: "1px solid rgba(39, 39, 42, 0.5)",
      }}
    >
      <div className="flex items-center gap-3">
        {/* Chain icon */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: chainInfo.color,
            boxShadow: `0 0 12px ${chainInfo.color}40`,
          }}
        >
          <span className="text-xs font-bold" style={{ color: "#0A0A0A" }}>
            {chainInfo.symbol}
          </span>
        </div>

        {/* Chain name */}
        <div>
          <p className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>
            {chain}
          </p>
          <p className="text-xs" style={{ color: "#71717A" }}>
            {percentage.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Value */}
      <p className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>
        ${parseFloat(value).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>
    </motion.div>
  );
}

/**
 * Get chain information
 */
function getChainInfo(chainId: number) {
  const chains: Record<number, { symbol: string; color: string }> = {
    1: { symbol: "ETH", color: "#627EEA" },
    137: { symbol: "POL", color: "#8247E5" },
    42161: { symbol: "ARB", color: "#28A0F0" },
    8453: { symbol: "BASE", color: "#0052FF" },
  };

  return chains[chainId] || { symbol: "?", color: "#71717A" };
}

/**
 * Format timestamp
 */
function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);

  if (diffSecs < 60) {
    return "just now";
  } else if (diffSecs < 3600) {
    const mins = Math.floor(diffSecs / 60);
    return `${mins} ${mins === 1 ? "minute" : "minutes"} ago`;
  } else {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}
