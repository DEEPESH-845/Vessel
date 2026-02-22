/**
 * ErrorState Component
 * 
 * Premium error state with shake animation and retry options
 */

"use client";

import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, HelpCircle } from "lucide-react";

interface ErrorStateProps {
  onRetry: () => void;
}

export default function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 18 }}
      className="flex-1 flex flex-col items-center justify-center gap-6 px-4 py-10"
      role="alert"
    >
      {/* Error Icon with shake */}
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: [0, -10, 10, -10, 10, 0] }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div 
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(244, 63, 94, 0.12), rgba(244, 63, 94, 0.05))",
            border: "1px solid rgba(244, 63, 94, 0.2)",
            boxShadow: "0 0 32px rgba(244, 63, 94, 0.15)",
          }}
        >
          <AlertCircle className="w-12 h-12" style={{ color: "#f43f5e" }} />
        </div>
      </motion.div>

      {/* Error text */}
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "24px",
            fontWeight: 600,
            color: "#FFFFFF",
          }}
        >
          Transaction Failed
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm mt-2 max-w-[280px]"
          style={{ color: "#71717A" }}
        >
          The transaction could not be completed. This might be due to network congestion or insufficient funds.
        </motion.p>
      </div>

      {/* Error details card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-[300px] p-4"
        style={{
          background: "rgba(244, 63, 94, 0.05)",
          border: "1px solid rgba(244, 63, 94, 0.1)",
          borderRadius: "14px",
        }}
      >
        <p className="text-xs" style={{ color: "#71717A" }}>
          <span style={{ color: "#f43f5e" }}>Error Code:</span> TX_FAILED
        </p>
        <p className="text-xs mt-1" style={{ color: "#52525B" }}>
          Please try again or contact support if the issue persists.
        </p>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col gap-3 w-full max-w-[280px]"
      >
        {/* Retry button */}
        <motion.button
          onClick={onRetry}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-xl font-semibold text-[15px] flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(135deg, #f43f5e, #e11d48)",
            color: "#FFFFFF",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </motion.button>

        {/* Help button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-xl font-medium text-[14px] flex items-center justify-center gap-2"
          style={{
            background: "rgba(24, 24, 27, 0.8)",
            border: "1px solid rgba(39, 39, 42, 0.6)",
            color: "#A1A1AA",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <HelpCircle className="w-4 h-4" />
          Get Help
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
