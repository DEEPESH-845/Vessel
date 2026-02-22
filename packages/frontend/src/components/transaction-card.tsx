/**
 * TransactionCard Component
 * 
 * Unified transaction card with optional animations and swipe actions.
 * Consolidates transaction-card, animated-transaction-card, and swipeable-transaction-card.
 * 
 * Features:
 * - Base styling with merchant name, amount, timestamp, and status
 * - Optional slide-in animation with framer-motion
 * - Optional swipe-to-reveal actions (delete/archive)
 */

"use client";

import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useState } from "react";
import { Transaction } from "@/types/wallet";

// =============================================================================
// Shared Utility Functions
// =============================================================================

/**
 * Formats a transaction amount with exactly 2 decimal places and "$" prefix
 */
export function formatAmount(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Gets the status indicator color based on transaction status
 */
export function getStatusColor(status: Transaction["status"]): string {
  switch (status) {
    case "completed":
      return "#CCFF00"; // Neon Green for completed
    case "pending":
      return "#FFA500"; // Orange for pending
    case "failed":
      return "#FF4444"; // Red for failed
    default:
      return "#CCFF00";
  }
}

/**
 * Gets the display text for transaction status
 */
export function getStatusText(status: Transaction["status"]): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/**
 * Gets merchant icon based on merchant name
 */
function getMerchantIcon(merchant: string): string {
  const lowerMerchant = merchant.toLowerCase();
  if (lowerMerchant.includes("coffee")) return "☕";
  if (lowerMerchant.includes("gas")) return "⛽";
  if (lowerMerchant.includes("restaurant") || lowerMerchant.includes("food")) return "🍽️";
  if (lowerMerchant.includes("store") || lowerMerchant.includes("shop")) return "🛍️";
  if (lowerMerchant.includes("grocery")) return "🛒";
  return "💳";
}

// =============================================================================
// Types
// =============================================================================

export interface TransactionCardProps {
  transaction: Transaction;
  /** Enable slide-in animation */
  animated?: boolean;
  /** Animation index for staggered animations */
  index?: number;
  /** Enable swipe-to-reveal actions */
  swipeable?: boolean;
  /** Callback when delete action is triggered */
  onDelete?: (id: string) => void;
  /** Callback when archive action is triggered */
  onArchive?: (id: string) => void;
}

// =============================================================================
// Base Card Content Component
// =============================================================================

interface CardContentProps {
  transaction: Transaction;
  showIcon?: boolean;
}

function CardContent({ transaction, showIcon = false }: CardContentProps) {
  const { merchant, amount, timestamp, status } = transaction;
  const formattedAmount = formatAmount(amount);
  const statusColor = getStatusColor(status);
  const statusText = getStatusText(status);
  const merchantIcon = getMerchantIcon(merchant);

  return (
    <div className="flex items-center justify-between">
      {/* Left side: Icon, Merchant and timestamp */}
      <div className={`flex items-center gap-3 ${showIcon ? 'flex-1 min-w-0' : 'flex-1 min-w-0'}`}>
        {showIcon && (
          <motion.div
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg"
            style={{
              background: "rgba(204, 255, 0, 0.08)",
              border: "1px solid rgba(204, 255, 0, 0.15)",
            }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {merchantIcon}
          </motion.div>
        )}

        <div className="flex-1 min-w-0">
          <h3
            className="font-medium truncate"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "16px",
              fontWeight: 500,
              color: "#FFFFFF",
              marginBottom: showIcon ? "2px" : "4px",
            }}
          >
            {merchant}
          </h3>
          <p
            className="text-sm"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: showIcon ? "13px" : "14px",
              color: "#A1A1AA",
            }}
          >
            {timestamp}
          </p>
        </div>
      </div>

      {/* Right side: Amount and status */}
      <div className="flex flex-col items-end ml-4">
        <p
          className="font-bold"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "16px",
            fontWeight: 700,
            color: "#FFFFFF",
            marginBottom: "4px",
          }}
        >
          {formattedAmount}
        </p>

        {/* Status indicator */}
        <div className="flex items-center gap-1.5">
          <div
            className="rounded-full"
            style={{
              width: "6px",
              height: "6px",
              backgroundColor: statusColor,
            }}
            aria-hidden="true"
          />
          <span
            className="text-xs"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              color: statusColor,
              fontWeight: 500,
            }}
          >
            {statusText}
          </span>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Swipeable Wrapper Component
// =============================================================================

interface SwipeWrapperProps {
  children: React.ReactNode;
  onDelete?: () => void;
  onArchive?: () => void;
}

function SwipeWrapper({ children, onDelete, onArchive }: SwipeWrapperProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const x = useMotionValue(0);
  const actionOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -50) {
      setIsRevealed(true);
      x.set(-100);
    } else {
      setIsRevealed(false);
      x.set(0);
    }
  };

  const handleAction = (action: "delete" | "archive") => {
    x.set(-300);
    setTimeout(() => {
      if (action === "delete" && onDelete) {
        onDelete();
      } else if (action === "archive" && onArchive) {
        onArchive();
      }
    }, 300);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Action buttons (revealed on swipe) */}
      <motion.div
        className="absolute right-0 top-0 bottom-0 flex items-center gap-2 pr-4"
        style={{ opacity: actionOpacity }}
      >
        {onArchive && (
          <motion.button
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(59, 130, 246, 0.2)",
              border: "1px solid rgba(59, 130, 246, 0.4)",
            }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleAction("archive")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4" />
            </svg>
          </motion.button>
        )}
        
        {onDelete && (
          <motion.button
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(239, 68, 68, 0.2)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
            }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleAction("delete")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
            </svg>
          </motion.button>
        )}
      </motion.div>

      {/* Swipeable card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
}

// =============================================================================
// Main TransactionCard Component
// =============================================================================

export default function TransactionCard({
  transaction,
  animated = false,
  index = 0,
  swipeable = false,
  onDelete,
  onArchive,
}: TransactionCardProps) {
  const { id } = transaction;
  const statusColor = getStatusColor(transaction.status);

  // Animation variants
  const cardContent = (
    <div
      data-testid="transaction-card"
      className="relative overflow-hidden"
      style={{
        background: animated 
          ? "linear-gradient(145deg, rgba(24, 24, 27, 0.95), rgba(24, 24, 27, 0.8))"
          : "#18181B",
        border: animated
          ? "1px solid rgba(39, 39, 42, 0.8)"
          : "1px solid #27272A",
        borderRadius: "20px",
        padding: "16px",
        minHeight: "72px",
        backdropFilter: animated ? "blur(16px)" : undefined,
        WebkitBackdropFilter: animated ? "blur(16px)" : undefined,
        boxShadow: animated ? "0 2px 12px rgba(0, 0, 0, 0.15)" : undefined,
      }}
    >
      {/* Animated glow effect on hover */}
      {animated && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(204, 255, 0, 0.05), transparent)",
            opacity: 0,
          }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          aria-hidden="true"
        />
      )}

      <CardContent 
        transaction={transaction} 
        showIcon={animated}
      />

      {/* Swipe indicator for animated cards */}
      {animated && (
        <motion.div
          className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-30 pointer-events-none"
          style={{ color: "#71717A" }}
          initial={{ x: -10 }}
          whileHover={{ x: 0 }}
          transition={{ duration: 0.2 }}
          aria-hidden="true"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 4L10 8L6 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      )}
    </div>
  );

  // Wrap with swipe functionality
  if (swipeable) {
    const wrappedContent = (
      <div className="group cursor-pointer">
        {cardContent}
      </div>
    );

    return (
      <SwipeWrapper
        onDelete={onDelete ? () => onDelete(id) : undefined}
        onArchive={onArchive ? () => onArchive(id) : undefined}
      >
        {wrappedContent}
      </SwipeWrapper>
    );
  }

  // Wrap with animation
  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{
          duration: 0.4,
          delay: index * 0.08,
          ease: [0.21, 0.47, 0.32, 0.98],
          type: "spring",
          stiffness: 100,
          damping: 15,
        }}
        whileHover={{
          scale: 1.02,
          x: -4,
          transition: { duration: 0.2 },
        }}
        whileTap={{ scale: 0.98 }}
      >
        {cardContent}
      </motion.div>
    );
  }

  // Base card (no animation)
  return cardContent;
}
