/**
 * PremiumTransactionsSection Component
 * 
 * Enhanced transaction list with section header and staggered animations
 */

"use client";

import { motion } from "framer-motion";
import { Transaction } from "@/types/wallet";
import AnimatedTransactionCard from "./animated-transaction-card";

interface PremiumTransactionsSectionProps {
  transactions: Transaction[];
}

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

export default function PremiumTransactionsSection({
  transactions,
}: PremiumTransactionsSectionProps) {
  const validTransactions = transactions.filter((transaction) => {
    const isValid = isValidTransaction(transaction);
    if (!isValid) {
      console.error("Invalid transaction data filtered out:", transaction);
    }
    return isValid;
  });

  if (validTransactions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div
          className="relative overflow-hidden"
          style={{
            background: "linear-gradient(145deg, rgba(24, 24, 27, 0.95), rgba(24, 24, 27, 0.8))",
            border: "1px solid rgba(39, 39, 42, 0.8)",
            borderRadius: "20px",
            padding: "48px 24px",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          {/* Empty state illustration */}
          <div className="flex flex-col items-center justify-center gap-4">
            <motion.div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(204, 255, 0, 0.08)",
                border: "1px solid rgba(204, 255, 0, 0.15)",
              }}
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#CCFF00"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </motion.div>

            <p
              className="text-center"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "15px",
                color: "#71717A",
                fontWeight: 500,
              }}
            >
              No recent transactions
            </p>

            <p
              className="text-center"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
                color: "#52525B",
              }}
            >
              Your transaction history will appear here
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex items-center justify-between px-1"
      >
        <div className="flex items-center gap-2">
          <h3
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "18px",
              fontWeight: 600,
              color: "#FFFFFF",
              letterSpacing: "-0.01em",
            }}
          >
            Recent Activity
          </h3>
          
          {/* Transaction count badge */}
          <motion.div
            className="px-2 py-0.5 rounded-full"
            style={{
              background: "rgba(204, 255, 0, 0.1)",
              border: "1px solid rgba(204, 255, 0, 0.2)",
            }}
            whileHover={{ scale: 1.05 }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#CCFF00",
                fontFeatureSettings: "'tnum' on",
              }}
            >
              {validTransactions.length}
            </span>
          </motion.div>
        </div>

        {/* Filter button (placeholder) */}
        <motion.button
          className="px-3 py-1.5 rounded-lg"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            color: "#71717A",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
          }}
          whileHover={{
            background: "rgba(255, 255, 255, 0.06)",
            scale: 1.02,
          }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-1.5">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            <span>Filter</span>
          </div>
        </motion.button>
      </motion.div>

      {/* Transaction list */}
      <div className="flex flex-col gap-3">
        {validTransactions.map((transaction, index) => (
          <AnimatedTransactionCard
            key={transaction.id}
            transaction={transaction}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
