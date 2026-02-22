/**
 * AIVerificationBadge Component
 * 
 * Premium trust indicator with pulsing shield animation and gradient effects
 */

"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, ShieldAlert } from "lucide-react";

interface AIVerificationBadgeProps {
  verified: boolean;
  reason: string;
}

export default function AIVerificationBadge({ verified, reason }: AIVerificationBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="relative overflow-hidden"
      style={{
        background: verified 
          ? "linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(34, 197, 94, 0.03))"
          : "linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(245, 158, 11, 0.03))",
        border: verified 
          ? "1px solid rgba(34, 197, 94, 0.2)"
          : "1px solid rgba(245, 158, 11, 0.2)",
        borderRadius: "16px",
      }}
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: verified
            ? "linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.05), transparent)"
            : "linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.05), transparent)",
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

      <div className="relative flex items-center gap-4 p-4">
        {/* Icon with glow */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            delay: 0.5, 
            type: "spring", 
            stiffness: 300,
            damping: 15 
          }}
          className="relative"
        >
          {/* Pulsing glow */}
          <motion.div
            className="absolute -inset-2 rounded-full opacity-50"
            style={{
              background: verified
                ? "radial-gradient(circle, rgba(34, 197, 94, 0.3), transparent 70%)"
                : "radial-gradient(circle, rgba(245, 158, 11, 0.3), transparent 70%)",
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            aria-hidden="true"
          />

          {/* Icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: verified
                ? "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))"
                : "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1))",
              border: verified
                ? "1px solid rgba(34, 197, 94, 0.3)"
                : "1px solid rgba(245, 158, 11, 0.3)",
            }}
          >
            {verified ? (
              <ShieldCheck className="w-6 h-6" style={{ color: "#22c55e" }} />
            ) : (
              <ShieldAlert className="w-6 h-6" style={{ color: "#f59e0b" }} />
            )}
          </div>
        </motion.div>

        {/* Text content */}
        <div className="flex-1">
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-base font-semibold flex items-center gap-2"
            style={{ 
              color: verified ? "#22c55e" : "#f59e0b",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {verified ? "AI Verified" : "Checking..."}
            {verified && (
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 opacity-70" />
              </motion.span>
            )}
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-sm mt-0.5"
            style={{ color: "#71717A" }}
          >
            {reason || "Analyzing transaction..."}
          </motion.p>
        </div>

        {/* Decorative sparkles for verified */}
        {verified && (
          <div className="absolute top-2 right-2 flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-1 rounded-full"
                style={{ background: "#CCFF00" }}
                animate={{
                  y: [-2, 2, -2],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
                aria-hidden="true"
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
