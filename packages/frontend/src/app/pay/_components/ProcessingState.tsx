/**
 * ProcessingState Component
 * 
 * Premium processing animation with orbital particles and glow effects
 */

"use client";

import { motion } from "framer-motion";

interface ProcessingStateProps {
  amount: number;
  merchantName: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function ProcessingState({ amount, merchantName }: ProcessingStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ 
        duration: 0.5, 
        ease: [0.21, 0.47, 0.32, 0.98] 
      }}
      className="flex-1 flex flex-col items-center justify-center gap-8 py-12"
      role="status"
      aria-label="Processing payment"
    >
      {/* Main spinner container */}
      <div className="relative">
        {/* Outer orbital ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: "2px solid rgba(99, 102, 241, 0.1)",
          }}
          animate={{ 
            rotate: 360,
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            rotate: { duration: 8, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          }}
          aria-hidden="true"
        />

        {/* Middle glow ring */}
        <motion.div
          className="absolute -inset-8 rounded-full"
          style={{
            border: "1px solid rgba(99, 102, 241, 0.15)",
          }}
          animate={{ 
            rotate: -360,
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            rotate: { duration: 12, repeat: Infinity, ease: "linear" },
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
          }}
          aria-hidden="true"
        />

        {/* Orbital particles - positioned around the circle */}
        {[0, 90, 180, 270].map((angle, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: "rgba(99, 102, 241, 0.8)",
              boxShadow: "0 0 12px rgba(99, 102, 241, 0.5)",
              top: "50%",
              left: "50%",
              marginTop: "-4px",
              marginLeft: "-4px",
            }}
            animate={{
              rotate: [angle, angle + 360],
              opacity: [0.8, 0.2, 0.8],
              scale: [1, 1.5, 1],
            }}
            transition={{
              rotate: { duration: 4, repeat: Infinity, ease: "linear" },
              opacity: { duration: 1.5, repeat: Infinity, delay: i * 0.2 },
              scale: { duration: 1.5, repeat: Infinity, delay: i * 0.2 },
            }}
            aria-hidden="true"
          />
        ))}

        {/* Pulsing glow */}
        <motion.div
          className="absolute -inset-12 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.3), transparent 70%)",
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          aria-hidden="true"
        />

        {/* Main spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="relative z-10"
        >
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="#6366f1"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="31.4 31.4"
            />
          </svg>
        </motion.div>

        {/* Center dot */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            boxShadow: "0 0 16px rgba(99, 102, 241, 0.6)",
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
          aria-hidden="true"
        />
      </div>

      {/* Text content */}
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "24px",
            fontWeight: 600,
            color: "#FFFFFF",
          }}
        >
          Sending
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm mt-2"
          style={{ color: "#71717A" }}
        >
          {formatCurrency(amount)} to {merchantName}
        </motion.p>

        {/* Animated dots */}
        <div className="flex justify-center gap-2 mt-4" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "rgba(99, 102, 241, 0.6)" }}
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Status message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="px-4 py-2 rounded-full"
        style={{
          background: "rgba(99, 102, 241, 0.08)",
          border: "1px solid rgba(99, 102, 241, 0.15)",
        }}
      >
        <p className="text-xs" style={{ color: "#6366f1" }}>
          Confirming on blockchain...
        </p>
      </motion.div>
    </motion.div>
  );
}
