/**
 * RecentTransactionsSection Component
 * 
 * Displays a vertical list of recent transactions using TransactionCard components.
 * Shows minimum of 5 most recent transactions (if available), or all available if fewer.
 * Displays an empty state message when no transactions exist.
 * 
 * Requirements: 3.1, 3.2, 3.9
 */

import React from "react";
import { Transaction } from "@/types/wallet";
import TransactionCard from "./transaction-card";

/**
 * Props for the RecentTransactionsSection component
 * 
 * @property transactions - Array of transaction data to display
 */
export interface RecentTransactionsSectionProps {
  transactions: Transaction[];
}

/**
 * Validates if a transaction has all required fields
 * 
 * @param transaction - The transaction to validate
 * @returns true if transaction is valid, false otherwise
 */
function isValidTransaction(transaction: any): transaction is Transaction {
  return (
    transaction &&
    typeof transaction.id === "string" &&
    typeof transaction.merchant === "string" &&
    typeof transaction.amount === "number" &&
    !isNaN(transaction.amount) &&
    typeof transaction.timestamp === "string" &&
    (transaction.status === "completed" ||
      transaction.status === "pending" ||
      transaction.status === "failed")
  );
}

/**
 * RecentTransactionsSection displays a list of recent transactions
 * with proper handling for empty states and minimum display requirements.
 */
export default function RecentTransactionsSection({
  transactions,
}: RecentTransactionsSectionProps) {
  // Filter out invalid transaction data
  const validTransactions = transactions.filter((transaction) => {
    const isValid = isValidTransaction(transaction);
    if (!isValid) {
      console.error("Invalid transaction data filtered out:", transaction);
    }
    return isValid;
  });

  // If no valid transactions, display empty state
  if (validTransactions.length === 0) {
    return (
      <div
        className="relative overflow-hidden"
        style={{
          background: "#18181B",
          border: "1px solid #27272A",
          borderRadius: "20px",
          padding: "24px",
        }}
      >
        <p
          className="text-center"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "14px",
            color: "#71717A", // Muted text color
          }}
        >
          No recent transactions
        </p>
      </div>
    );
  }

  // Display all available transactions (minimum 5 if available, otherwise all)
  // The requirement states "minimum of 5 most recent" which means show at least 5 if available
  // If fewer than 5, show all available
  const transactionsToDisplay = validTransactions;

  return (
    <div className="flex flex-col gap-4">
      {transactionsToDisplay.map((transaction) => (
        <TransactionCard key={transaction.id} transaction={transaction} />
      ))}
    </div>
  );
}
