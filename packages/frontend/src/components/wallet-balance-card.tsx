/**
 * WalletBalanceCard Component
 * 
 * Displays the user's total cryptocurrency balance prominently.
 * Follows the "Rise & Grind" design system with glassmorphism effects.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 5.1, 5.2, 5.4, 5.5, 5.6, 5.8
 */

import React from "react";

/**
 * Props for the WalletBalanceCard component
 * 
 * @property balance - The wallet balance in USD
 */
export interface WalletBalanceCardProps {
  balance: number | null | undefined;
}

/**
 * Formats a balance value with exactly 2 decimal places and "$" prefix
 * 
 * @param balance - The balance value to format
 * @returns Formatted balance string (e.g., "$1,234.56")
 */
export function formatBalance(balance: number | null | undefined): string {
  // Handle missing balance data - display "$0.00"
  if (balance === null || balance === undefined || isNaN(balance)) {
    console.error("Missing or invalid balance data, displaying $0.00");
    return "$0.00";
  }
  return `$${balance.toFixed(2)}`;
}

/**
 * WalletBalanceCard displays the user's total cryptocurrency balance
 * with the "Rise & Grind" design system styling.
 */
export default function WalletBalanceCard({ balance }: WalletBalanceCardProps) {
  const formattedBalance = formatBalance(balance);

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: "#18181B",
        border: "1px solid #27272A",
        borderRadius: "24px",
        padding: "24px",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      {/* Glassmorphism overlay for subtle transparency */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "rgba(255, 255, 255, 0.02)",
          backdropFilter: "blur(24px) saturate(1.8)",
          WebkitBackdropFilter: "blur(24px) saturate(1.8)",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Label with Neon Green accent */}
        <p
          className="text-sm mb-2"
          style={{
            color: "#CCFF00",
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Total Balance
        </p>

        {/* Balance display with Space Grotesk font */}
        <h2
          className="font-bold"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "20px",
            fontWeight: 700,
            color: "#FFFFFF",
            letterSpacing: "-0.01em",
          }}
        >
          {formattedBalance}
        </h2>
      </div>

      {/* Neon Green accent highlight */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{
          background: "linear-gradient(90deg, transparent, #CCFF00, transparent)",
          opacity: 0.3,
        }}
        aria-hidden="true"
      />
    </div>
  );
}
