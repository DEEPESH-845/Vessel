/**
 * SwipeableTransactionCard Component
 * 
 * Enhanced transaction card with swipe-to-reveal actions
 * Swipe left to reveal delete/archive actions
 */

"use client";

import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useState } from "react";
import { Transaction } from "@/types/wallet";
import AnimatedTransactionCard from "./animated-transaction-card";

interface SwipeableTransactionCardProps {
  transaction: Transaction;
  index: number;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
}

export default function SwipeableTransactionCard({
  transaction,
  index,
  onDelete,
  onArchive,
}: SwipeableTransactionCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const x = useMotionValue(0);
  
  // Transform swipe distance to action button opacity
  const actionOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    // Reveal actions if swiped left more than 50px
    if (info.offset.x < -50) {
      setIsRevealed(true);
      x.set(-100);
    } else {
      setIsRevealed(false);
      x.set(0);
    }
  };

  const handleAction = (action: "delete" | "archive") => {
    // Animate out
    x.set(-300);
    setTimeout(() => {
      if (action === "delete" && onDelete) {
        onDelete(transaction.id);
      } else if (action === "archive" && onArchive) {
        onArchive(transaction.id);
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
        <AnimatedTransactionCard transaction={transaction} index={index} />
      </motion.div>
    </div>
  );
}
