/**
 * PremiumAmountSection Component
 * 
 * Animated amount display with odometer effect, glow, and edit functionality
 */

"use client";

import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Pencil, AlertCircle } from "lucide-react";

interface PremiumAmountSectionProps {
  amount: number;
  token: string;
  maxBalance: number;
  onAmountChange: (newAmount: number) => void;
}

/** Format a number as USD currency */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function PremiumAmountSection({
  amount,
  token,
  maxBalance,
  onAmountChange,
}: PremiumAmountSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(amount.toFixed(2));
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Animated counter using spring physics
  const springValue = useMotionValue(amount);
  const displayValue = useSpring(springValue, {
    stiffness: 100,
    damping: 20,
  });

  const formattedValue = useTransform(displayValue, (latest) => 
    formatCurrency(latest)
  );

  useEffect(() => {
    if (!isEditing) {
      springValue.set(amount);
    }
  }, [amount, isEditing, springValue]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditValue(amount.toFixed(2));
    setError("");
    setIsEditing(true);
  };

  const handleValidateAndSave = () => {
    const num = parseFloat(editValue);

    if (isNaN(num) || num <= 0) {
      setError("Enter a valid amount");
      return;
    }

    if (num < 0.01) {
      setError("Minimum $0.01");
      return;
    }

    if (num > maxBalance) {
      setError(`Max ${formatCurrency(maxBalance)}`);
      return;
    }

    onAmountChange(num);
    setError("");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleValidateAndSave();
    if (e.key === "Escape") {
      setIsEditing(false);
      setError("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(val) || val === "") {
      setEditValue(val);
      setError("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="relative"
    >
      {/* Glow effect */}
      <motion.div
        className="absolute -inset-8 rounded-full opacity-0"
        style={{
          background: "radial-gradient(circle, rgba(204, 255, 0, 0.1), transparent 70%)",
        }}
        animate={{
          opacity: [0, 0.3, 0],
          scale: [0.9, 1.1, 0.9],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        aria-hidden="true"
      />

      {/* Amount Display */}
      <div className="text-center py-4">
        {isEditing ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="relative flex items-center justify-center">
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "56px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  letterSpacing: "-0.02em",
                }}
              >
                $
              </span>
              <input
                ref={inputRef}
                type="text"
                inputMode="decimal"
                value={editValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onBlur={handleValidateAndSave}
                className="bg-transparent outline-none text-center"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "56px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  width: "240px",
                  letterSpacing: "-0.02em",
                }}
              />
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm flex items-center gap-1 mt-2"
                style={{ color: "#f43f5e" }}
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.p>
            )}
          </motion.div>
        ) : (
          <motion.button
            onClick={handleStartEdit}
            className="group cursor-pointer focus-ring rounded-2xl px-6 py-3 -mx-6 transition-all hover:bg-white/[0.02]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Main Amount */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <h3
                className="text-gradient"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "56px",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  background: "linear-gradient(135deg, #FFFFFF 0%, #CCFF00 50%, #6366f1 100%)",
                  backgroundSize: "200% 200%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "gradient-shift 4s ease infinite",
                }}
              >
                {formatCurrency(amount)}
              </h3>
            </motion.div>

            {/* Token with Edit Icon */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg flex items-center justify-center gap-2 mt-2"
              style={{ color: "#71717A" }}
            >
              {token}
              <Pencil className="w-4 h-4 opacity-30 group-hover:opacity-60 transition-opacity" />
            </motion.p>

            {/* Tap hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.4 }}
              className="text-xs mt-2"
              style={{ color: "#52525B" }}
            >
              Tap to edit
            </motion.p>
          </motion.button>
        )}
      </div>

      {/* Decorative line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="h-px mx-auto w-24"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(204, 255, 0, 0.3), transparent)",
        }}
      />
    </motion.div>
  );
}
