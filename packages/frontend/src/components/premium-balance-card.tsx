/**
 * PremiumBalanceCard Component
 * 
 * Enhanced version of WalletBalanceCard with premium animations and interactions
 * Wraps existing component with motion and visual enhancements
 */

"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import WalletBalanceCard, { formatBalance } from "./wallet-balance-card";

interface PremiumBalanceCardProps {
  balance: number | null | undefined;
}

export default function PremiumBalanceCard({ balance }: PremiumBalanceCardProps) {
  const [displayBalance, setDisplayBalance] = useState(0);
  const springValue = useSpring(0, {
    stiffness: 50,
    damping: 20,
    mass: 1,
  });

  // Animated counter effect
  useEffect(() => {
    if (balance !== null && balance !== undefined && !isNaN(balance)) {
      springValue.set(balance);
    }
  }, [balance, springValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayBalance(latest);
    });
    return unsubscribe;
  }, [springValue]);

  const formattedBalance = formatBalance(displayBalance);

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
      whileTap={{ scale: 0.99 }}
      className="relative"
    >
      {/* Ambient glow effect */}
      <motion.div
        className="absolute -inset-4 rounded-3xl opacity-0"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15), transparent 70%)",
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

      {/* Enhanced card with animated balance */}
      <div
        className="relative overflow-hidden group"
          style={{
            background: "linear-gradient(145deg, rgba(14, 19, 32, 0.95), rgba(14, 19, 32, 0.8))",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            borderRadius: "24px",
            padding: "24px",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 60px rgba(59, 130, 246, 0.1)",
          }}
      >
        {/* Shimmer effect on hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.05) 50%, transparent 100%)",
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

        {/* Glassmorphism overlay */}
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
          {/* Label with enhanced styling */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex items-center gap-2 mb-3"
          >
            <p
              className="text-sm"
              style={{
            color: "#60A5FA",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            textShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
              }}
            >
              Total Balance
            </p>
            
            {/* Live indicator */}
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{
                background: "#3B82F6",
                boxShadow: "0 0 8px rgba(59, 130, 246, 0.6)",
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

          {/* Animated balance display */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="font-bold"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(28px, 6vw, 36px)",
              fontWeight: 700,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
              fontFeatureSettings: "'tnum' on, 'lnum' on",
            }}
          >
            {formattedBalance}
          </motion.h2>

          {/* Trend indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="flex items-center gap-2 mt-3"
          >
            <motion.div
              className="flex items-center gap-1 px-2 py-1 rounded-full"
              style={{
                background: "rgba(34, 197, 94, 0.1)",
                border: "1px solid rgba(34, 197, 94, 0.2)",
              }}
              whileHover={{ scale: 1.05 }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                style={{ color: "#22c55e" }}
              >
                <path
                  d="M6 2L6 10M6 2L3 5M6 2L9 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#22c55e",
                  fontFeatureSettings: "'tnum' on",
                }}
              >
                +12.5%
              </span>
            </motion.div>
            <span
              style={{
                fontSize: "12px",
                color: "#71717A",
                fontWeight: 500,
              }}
            >
              vs last week
            </span>
          </motion.div>
        </div>

        {/* Enhanced accent highlight */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1"
              style={{
                background: "linear-gradient(90deg, transparent, #3B82F6, transparent)",
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

        {/* Corner accents */}
        <div
          className="absolute top-0 right-0 w-24 h-24 opacity-10 pointer-events-none"
          style={{
            background: "radial-gradient(circle at top right, rgba(59, 130, 246, 0.3), transparent 70%)",
          }}
          aria-hidden="true"
        />
      </div>
    </motion.div>
  );
}
