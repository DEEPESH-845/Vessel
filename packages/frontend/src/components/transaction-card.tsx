/**
 * TransactionCard Component
 * 
 * Displays a single transaction with merchant name, amount, timestamp, and status.
 * Follows the "Rise & Grind" design system with consistent styling.
 * 
 * Requirements: 3.3, 3.4, 3.5, 3.6, 3.7, 3.8
 */

import React from "react";
import { Transaction } from "@/types/wallet";

/**
 * Props for the TransactionCard component
 * 
 * @property transaction - The transaction data to display
 */
export interface TransactionCardProps {
  transaction: Transaction;
}

/**
 * Formats a transaction amount with exactly 2 decimal places and "$" prefix
 * 
 * @param amount - The amount value to format
 * @returns Formatted amount string (e.g., "$123.45")
 */
export function formatAmount(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Gets the status indicator color based on transaction status
 * 
 * @param status - The transaction status
 * @returns Color hex code for the status
 */
function getStatusColor(status: Transaction["status"]): string {
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
 * 
 * @param status - The transaction status
 * @returns Capitalized status text
 */
function getStatusText(status: Transaction["status"]): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/**
 * TransactionCard displays a single transaction with all required details
 * using the "Rise & Grind" design system styling.
 */
export default function TransactionCard({ transaction }: TransactionCardProps) {
  const { merchant, amount, timestamp, status } = transaction;
  const formattedAmount = formatAmount(amount);
  const statusColor = getStatusColor(status);
  const statusText = getStatusText(status);

  return (
    <div
      data-testid="transaction-card"
      className="relative overflow-hidden"
      style={{
        background: "#18181B",
        border: "1px solid #27272A",
        borderRadius: "20px",
        padding: "16px",
        minHeight: "72px", // Ensures adequate touch target size (minimum 44px + padding)
      }}
    >
      {/* Content */}
      <div className="flex items-center justify-between">
        {/* Left side: Merchant and timestamp */}
        <div className="flex-1 min-w-0">
          {/* Merchant name with Inter font */}
          <h3
            className="font-medium truncate"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "16px",
              fontWeight: 500,
              color: "#FFFFFF",
              marginBottom: "4px",
            }}
          >
            {merchant}
          </h3>

          {/* Timestamp with Inter font */}
          <p
            className="text-sm"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "14px",
              color: "#A1A1AA",
            }}
          >
            {timestamp}
          </p>
        </div>

        {/* Right side: Amount and status */}
        <div className="flex flex-col items-end ml-4">
          {/* Amount with Space Grotesk font */}
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
            {/* Status dot */}
            <div
              className="rounded-full"
              style={{
                width: "6px",
                height: "6px",
                backgroundColor: statusColor,
              }}
              aria-hidden="true"
            />

            {/* Status text with Inter font */}
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
    </div>
  );
}
