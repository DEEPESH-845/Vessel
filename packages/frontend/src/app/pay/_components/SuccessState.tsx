/**
 * SuccessState Component
 * 
 * Premium success animation with checkmark draw, glow effects, and confetti
 */

"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { Check, BadgeCheck, ExternalLink, Share2 } from "lucide-react";
import confetti from "canvas-confetti";

interface SuccessStateProps {
  amount: number;
  token: string;
  merchantName: string;
  merchantVerified: boolean;
  txHash: string;
  onDone: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function SuccessState({
  amount,
  token,
  merchantName,
  merchantVerified,
  txHash,
  onDone,
}: SuccessStateProps) {
  // Trigger confetti on mount
  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ["#6366f1", "#06d6a0", "#8b5cf6", "#22c55e", "#CCFF00"];

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors,
        ticks: 100,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors,
        ticks: 100,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([50, 50, 50]);
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 18, stiffness: 120 }}
      className="flex-1 flex flex-col items-center justify-center gap-6 px-4 py-8"
    >
      {/* Success Checkmark */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          damping: 14,
          stiffness: 180,
          delay: 0.1,
        }}
        className="relative"
      >
        {/* Outer glow rings */}
        <motion.div
          className="absolute -inset-12 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(34,197,94,0.25), transparent 70%)",
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
          aria-hidden="true"
        />

        <motion.div
          className="absolute -inset-6 rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(34,197,94,0.2), transparent 70%)",
          }}
          animate={{
            scale: [1.1, 1.25, 1.1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          aria-hidden="true"
        />

        {/* Main circle */}
        <div 
          className="w-28 h-28 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))",
            border: "1px solid rgba(34, 197, 94, 0.25)",
            boxShadow: "0 0 48px rgba(34, 197, 94, 0.2), 0 0 96px rgba(34, 197, 94, 0.08)",
          }}
        >
          {/* Animated checkmark */}
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <motion.path
              d="M5 12l5 5L20 7"
              stroke="#22c55e"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.3, duration: 0.5, ease: "easeInOut" }}
            />
          </svg>
        </div>
      </motion.div>

      {/* Success text */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="text-center"
      >
        <h2 
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "28px",
            fontWeight: 700,
            color: "#FFFFFF",
            letterSpacing: "-0.02em",
          }}
        >
          Sent!
        </h2>
        <p 
          className="text-sm mt-1"
          style={{ color: "#71717A" }}
        >
          {formatCurrency(amount)} {token}
        </p>
      </motion.div>

      {/* Merchant info */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-2 px-4 py-2.5"
        style={{
          background: "rgba(24, 24, 27, 0.8)",
          border: "1px solid rgba(39, 39, 42, 0.6)",
          borderRadius: "14px",
        }}
      >
        <span style={{ color: "#52525B", fontSize: "12px" }}>to</span>
        <span 
          style={{ 
            color: "#FFFFFF", 
            fontSize: "14px", 
            fontWeight: 500,
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {merchantName}
        </span>
        {merchantVerified && (
          <BadgeCheck className="w-4 h-4" style={{ color: "#CCFF00" }} />
        )}
      </motion.div>

      {/* Transaction hash */}
      <motion.a
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        href={`https://etherscan.io/tx/${txHash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl group"
        style={{
          background: "rgba(24, 24, 27, 0.6)",
          border: "1px solid rgba(39, 39, 42, 0.4)",
        }}
      >
        <span 
          className="text-xs font-mono"
          style={{ color: "#52525B" }}
        >
          {txHash.slice(0, 10)}...{txHash.slice(-8)}
        </span>
        <ExternalLink 
          className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" 
          style={{ color: "#52525B" }} 
        />
      </motion.a>

      {/* Share button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
        onClick={() => {
          if (navigator.share) {
            navigator.share({
              title: 'Payment Sent',
              text: `I just sent ${formatCurrency(amount)} ${token} to ${merchantName} using Vessel!`,
            });
          }
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 px-4 py-2 rounded-xl"
        style={{
          background: "rgba(99, 102, 241, 0.1)",
          border: "1px solid rgba(99, 102, 241, 0.2)",
        }}
      >
        <Share2 className="w-4 h-4" style={{ color: "#6366f1" }} />
        <span className="text-sm" style={{ color: "#6366f1" }}>Share</span>
      </motion.button>

      {/* Done button */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
        onClick={onDone}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full max-w-[280px] py-4 rounded-xl font-semibold text-[15px] mt-2"
        style={{
          background: "linear-gradient(135deg, #22c55e, #16a34a)",
          color: "#FFFFFF",
          boxShadow: "0 4px 20px rgba(34, 197, 94, 0.25)",
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        Done
      </motion.button>
    </motion.div>
  );
}
