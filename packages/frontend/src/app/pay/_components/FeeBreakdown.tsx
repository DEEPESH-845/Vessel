/**
 * FeeBreakdown Component
 * 
 * Animated accordion-style fee display with smooth expand/collapse
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Zap, ChevronDown } from "lucide-react";

interface FeeBreakdownProps {
  amount: number;
  gasSponsored: boolean;
  serviceFee: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function FeeBreakdown({ amount, gasSponsored, serviceFee }: FeeBreakdownProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const total = amount + serviceFee;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(24, 24, 27, 0.8), rgba(24, 24, 27, 0.6))",
        border: "1px solid rgba(39, 39, 42, 0.6)",
        borderRadius: "16px",
      }}
    >
      {/* Header - Always visible */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 cursor-pointer focus-ring"
        whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
        whileTap={{ scale: 0.99 }}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          {/* Animated icon */}
          <motion.div
            animate={{ 
              boxShadow: gasSponsored 
                ? ["0 0 0 rgba(34,197,94,0)", "0 0 20px rgba(34,197,94,0.3)", "0 0 0 rgba(34,197,94,0)"] 
                : "none" 
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: gasSponsored 
                ? "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))"
                : "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05))",
              border: gasSponsored 
                ? "1px solid rgba(34, 197, 94, 0.3)"
                : "1px solid rgba(99, 102, 241, 0.3)",
            }}
          >
            <Zap 
              className="w-4 h-4" 
              style={{ color: gasSponsored ? "#22c55e" : "#6366f1" }} 
            />
          </motion.div>
          
          <div className="text-left">
            <span 
              className="text-sm font-medium"
              style={{ color: "#A1A1AA" }}
            >
              Total
            </span>
            <p 
              className="text-xs mt-0.5"
              style={{ color: "#52525B" }}
            >
              {gasSponsored ? "Gas sponsored by Vessel" : "Including network fees"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.span
            key={total}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-semibold text-base"
            style={{ 
              color: "#FFFFFF",
              fontFeatureSettings: "'tnum' on",
            }}
          >
            {formatCurrency(total)}
          </motion.span>
          
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" style={{ color: "#52525B" }} />
          </motion.div>
        </div>
      </motion.button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="overflow-hidden"
          >
            <div 
              className="px-4 pb-4 space-y-2"
              style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
            >
              {/* Subtotal */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex justify-between py-2"
              >
                <span style={{ color: "#71717A", fontSize: "13px" }}>Subtotal</span>
                <span style={{ color: "#A1A1AA", fontSize: "13px" }}>
                  {formatCurrency(amount)}
                </span>
              </motion.div>

              {/* Network Gas */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="flex justify-between py-2"
              >
                <span style={{ color: "#71717A", fontSize: "13px" }}>Network Gas</span>
                <motion.span
                  initial={{ color: "#71717A" }}
                  animate={{ color: gasSponsored ? "#22c55e" : "#A1A1AA" }}
                  transition={{ delay: 0.2 }}
                  className="text-sm font-medium"
                >
                  {gasSponsored ? "Sponsored" : "$0.00"}
                </motion.span>
              </motion.div>

              {/* Service Fee */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex justify-between py-2"
              >
                <span style={{ color: "#71717A", fontSize: "13px" }}>Service Fee</span>
                <span style={{ color: "#A1A1AA", fontSize: "13px" }}>
                  ${serviceFee.toFixed(2)}
                </span>
              </motion.div>

              {/* Divider */}
              <div 
                className="h-px my-2"
                style={{ 
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" 
                }} 
              />

              {/* Total */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="flex justify-between pt-2"
              >
                <span className="text-sm font-medium" style={{ color: "#FFFFFF" }}>Total</span>
                <span 
                  className="text-sm font-semibold"
                  style={{ 
                    color: "#CCFF00",
                    fontFeatureSettings: "'tnum' on",
                  }}
                >
                  {formatCurrency(total)}
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
