/**
 * PendingTransactionsBanner Component
 * Displays pending transactions prominently at the top of the dashboard
 * Requirements: FR-11.7
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PendingTransaction } from "@/types/transaction.types";
import { useEffect, useState } from "react";

interface PendingTransactionsBannerProps {
  pendingTransactions: PendingTransaction[];
  onCancel?: (hash: string) => void;
}

export default function PendingTransactionsBanner({
  pendingTransactions,
  onCancel,
}: PendingTransactionsBannerProps) {
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every second for real-time countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Don't render if no pending transactions
  if (!pendingTransactions || pendingTransactions.length === 0) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <div
          className="rounded-2xl p-4 border"
          style={{
            background: "linear-gradient(135deg, #18181B 0%, #1A1A1F 100%)",
            borderColor: "#CCFF00",
            borderWidth: "1px",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 rounded-full border-2"
                  style={{
                    borderColor: "#CCFF00",
                    borderTopColor: "transparent",
                  }}
                />
              </div>
              <h3 className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>
                {pendingTransactions.length} Pending Transaction
                {pendingTransactions.length !== 1 ? "s" : ""}
              </h3>
            </div>
          </div>

          {/* Transaction List */}
          <div className="space-y-2">
            {pendingTransactions.map((tx) => (
              <PendingTransactionCard
                key={tx.hash}
                transaction={tx}
                currentTime={currentTime}
                onCancel={onCancel}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Individual pending transaction card
 */
interface PendingTransactionCardProps {
  transaction: PendingTransaction;
  currentTime: number;
  onCancel?: (hash: string) => void;
}

function PendingTransactionCard({
  transaction,
  currentTime,
  onCancel,
}: PendingTransactionCardProps) {
  const { hash, type, status, submittedAt, confirmations = 0, requiredConfirmations = 12, cancellable } = transaction;

  // Calculate elapsed time - handle both Date and number types
  const submittedAtMs = submittedAt instanceof Date ? submittedAt.getTime() : submittedAt;
  const elapsedSeconds = Math.floor((currentTime - submittedAtMs) / 1000);
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);

  // Estimate confirmation time (rough estimate: 15 seconds per confirmation)
  const estimatedSecondsPerConfirmation = 15;
  const remainingConfirmations = requiredConfirmations - confirmations;
  const estimatedSecondsRemaining = remainingConfirmations * estimatedSecondsPerConfirmation;
  const estimatedMinutesRemaining = Math.ceil(estimatedSecondsRemaining / 60);

  // Format transaction type
  const typeLabel = formatTransactionType(type);
  const typeIcon = getTransactionTypeIcon(type);

  // Check if transaction is cancellable
  const isCancellable = cancellable !== undefined ? cancellable : (status === "pending" && elapsedSeconds < 30);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="rounded-xl p-3 border"
      style={{
        background: "#18181B",
        borderColor: "#27272A",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Icon and Details */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Type Icon */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "#27272A" }}
          >
            <span className="text-lg">{typeIcon}</span>
          </div>

          {/* Transaction Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium" style={{ color: "#FFFFFF" }}>
                {typeLabel}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: status === "pending" ? "#3F3F46" : "#27272A",
                  color: status === "pending" ? "#CCFF00" : "#A1A1AA",
                }}
              >
                {status === "pending" ? "Pending" : `${confirmations}/${requiredConfirmations} confirmations`}
              </span>
            </div>

            {/* Transaction Hash */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono truncate" style={{ color: "#71717A" }}>
                {hash.slice(0, 10)}...{hash.slice(-8)}
              </span>
              <button
                onClick={() => copyToClipboard(hash)}
                className="text-xs hover:opacity-80 transition-opacity"
                style={{ color: "#CCFF00" }}
                title="Copy transaction hash"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2" />
                </svg>
              </button>
            </div>

            {/* Time Information */}
            <div className="flex items-center gap-4 text-xs" style={{ color: "#71717A" }}>
              <span>Submitted {elapsedMinutes > 0 ? `${elapsedMinutes}m ago` : `${elapsedSeconds}s ago`}</span>
              {status === "confirming" && estimatedMinutesRemaining > 0 && (
                <span style={{ color: "#CCFF00" }}>
                  ~{estimatedMinutesRemaining}m remaining
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Cancel Button */}
        {isCancellable && onCancel && (
          <button
            type="button"
            onClick={() => onCancel(hash)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
            style={{
              background: "#27272A",
              color: "#FFFFFF",
              border: "1px solid #3F3F46",
            }}
          >
            Cancel
          </button>
        )}
      </div>

      {/* Progress Bar for Confirming Status */}
      {status === "confirming" && (
        <div className="mt-3">
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "#27272A" }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(confirmations / requiredConfirmations) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
              className="h-full rounded-full"
              style={{ background: "#CCFF00" }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Format transaction type for display
 */
function formatTransactionType(type: string): string {
  const typeMap: Record<string, string> = {
    send: "Send",
    receive: "Receive",
    swap: "Swap",
    bridge: "Bridge",
    contract: "Contract Interaction",
  };
  return typeMap[type] || type;
}

/**
 * Get icon for transaction type
 */
function getTransactionTypeIcon(type: string): string {
  const iconMap: Record<string, string> = {
    send: "↑",
    receive: "↓",
    swap: "⇄",
    bridge: "🌉",
    contract: "📄",
  };
  return iconMap[type] || "•";
}

/**
 * Copy text to clipboard
 */
function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch((err) => {
    console.error("Failed to copy:", err);
  });
}
