/**
 * AnimatedTransactionCard Component
 * 
 * Enhanced transaction card with slide-in animation and hover effects
 * Wraps existing TransactionCard with premium interactions
 */

"use client";

import { motion } from "framer-motion";
import { Transaction } from "@/types/wallet";
import { formatAmount } from "./transaction-card";

interface AnimatedTransactionCardProps {
  transaction: Transaction;
  index: number;
}

function getStatusColor(status: Transaction["status"]): string {
  switch (status) {
    case "completed":
      return "#CCFF00";
    case "pending":
      return "#FFA500";
    case "failed":
      return "#FF4444";
    default:
      return "#CCFF00";
  }
}

function getStatusText(status: Transaction["status"]): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// Merchant icon mapping (simplified)
function getMerchantIcon(merchant: string): string {
  const lowerMerchant = merchant.toLowerCase();
  if (lowerMerchant.includes("coffee")) return "☕";
  if (lowerMerchant.includes("gas")) return "⛽";
  if (lowerMerchant.includes("restaurant") || lowerMerchant.includes("food")) return "🍽️";
  if (lowerMerchant.includes("store") || lowerMerchant.includes("shop")) return "🛍️";
  if (lowerMerchant.includes("grocery")) return "🛒";
  return "💳";
}

export default function AnimatedTransactionCard({
  transaction,
  index,
}: AnimatedTransactionCardProps) {
  const { merchant, amount, timestamp, status } = transaction;
  const formattedAmount = formatAmount(amount);
  const statusColor = getStatusColor(status);
  const statusText = getStatusText(status);
  const merchantIcon = getMerchantIcon(merchant);

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
      <div
        data-testid="transaction-card"
        className="relative overflow-hidden group cursor-pointer"
        style={{
          background: "linear-gradient(145deg, rgba(24, 24, 27, 0.95), rgba(24, 24, 27, 0.8))",
          border: "1px solid rgba(39, 39, 42, 0.8)",
          borderRadius: "20px",
          padding: "16px",
          minHeight: "72px",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.15)",
          transition: "box-shadow 0.2s ease",
        }}
      >
        {/* Hover glow effect */}
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

        {/* Content */}
        <div className="flex items-center justify-between relative z-10">
          {/* Left side: Icon, Merchant and timestamp */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Merchant icon */}
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

            <div className="flex-1 min-w-0">
              {/* Merchant name */}
              <motion.h3
                className="font-medium truncate"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#FFFFFF",
                  marginBottom: "2px",
                }}
                whileHover={{ x: 2 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {merchant}
              </motion.h3>

              {/* Timestamp */}
              <p
                className="text-sm"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "13px",
                  color: "#71717A",
                }}
              >
                {timestamp}
              </p>
            </div>
          </div>

          {/* Right side: Amount and status */}
          <div className="flex flex-col items-end ml-4 flex-shrink-0">
            {/* Amount */}
            <motion.p
              className="font-bold"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "17px",
                fontWeight: 700,
                color: "#FFFFFF",
                marginBottom: "4px",
                fontFeatureSettings: "'tnum' on, 'lnum' on",
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
              }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {formattedAmount}
            </motion.p>

            {/* Status indicator */}
            <div className="flex items-center gap-1.5">
              {/* Animated status dot */}
              <motion.div
                className="rounded-full"
                style={{
                  width: "6px",
                  height: "6px",
                  backgroundColor: statusColor,
                  boxShadow: `0 0 8px ${statusColor}`,
                }}
                animate={{
                  opacity: status === "pending" ? [1, 0.4, 1] : 1,
                  scale: status === "pending" ? [1, 1.2, 1] : 1,
                }}
                transition={{
                  duration: 2,
                  repeat: status === "pending" ? Infinity : 0,
                  ease: "easeInOut",
                }}
                aria-hidden="true"
              />

              {/* Status text */}
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

        {/* Swipe indicator (subtle hint) */}
        <motion.div
          className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-30 pointer-events-none"
          style={{
            color: "#71717A",
          }}
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
      </div>
    </motion.div>
  );
}
