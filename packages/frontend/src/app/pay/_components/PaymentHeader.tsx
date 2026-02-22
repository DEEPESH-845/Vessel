/**
 * PaymentHeader Component
 * 
 * Premium header with animated back button and title
 */

"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

interface PaymentHeaderProps {
  onBack: () => void;
}

export default function PaymentHeader({ onBack }: PaymentHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <motion.button
        onClick={onBack}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.02, x: -2 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 group"
        style={{
          background: "linear-gradient(145deg, rgba(24, 24, 27, 0.95), rgba(24, 24, 27, 0.8))",
          border: "1px solid rgba(39, 39, 42, 0.8)",
          borderRadius: "14px",
          padding: "12px 16px",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
        aria-label="Go back"
      >
        {/* Animated arrow */}
        <motion.div
          initial={{ x: 0 }}
          whileHover={{ x: -4 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <ArrowLeft 
            className="w-4 h-4 transition-colors" 
            style={{ color: "#CCFF00" }} 
          />
        </motion.div>
        
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "14px",
            fontWeight: 600,
            color: "#FFFFFF",
          }}
        >
          Back
        </span>
      </motion.button>
    </motion.div>
  );
}
