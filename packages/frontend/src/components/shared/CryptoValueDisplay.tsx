"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CryptoValueDisplayProps {
  value: string;
  prefix?: string;
  suffix?: string;
  usdEquivalent?: string;
  size?: "sm" | "md" | "lg";
  trend?: "up" | "down" | "neutral";
  className?: string;
}

/**
 * CryptoValueDisplay — Large numeric price display
 * 
 * Font: var(--font-mono) bold
 * Size: 28–34px
 * Color: var(--text-value)
 * Prefix symbol (~, |) in var(--text-secondary) slightly smaller
 * USD equivalent below in 14px var(--text-secondary)
 */
export function CryptoValueDisplay({
  value,
  prefix,
  suffix,
  usdEquivalent,
  size = "md",
  trend = "neutral",
  className,
}: CryptoValueDisplayProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const trendColors = {
    up: "text-[var(--color-green-pos)]",
    down: "text-[var(--color-red-neg)]",
    neutral: "text-[var(--color-text-value)]",
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-baseline gap-1">
        {prefix && (
          <span className="text-[var(--color-text-secondary)] text-sm font-normal">
            {prefix}
          </span>
        )}
        <motion.span
          className={cn(
            "font-mono font-bold tabular-nums",
            sizeClasses[size],
            trendColors[trend]
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {value}
        </motion.span>
        {suffix && (
          <span className="text-[var(--color-text-secondary)] text-sm font-normal">
            {suffix}
          </span>
        )}
      </div>
      {usdEquivalent && (
        <motion.span
          className="text-xs text-[var(--color-text-secondary)] font-mono mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          {usdEquivalent}
        </motion.span>
      )}
    </div>
  );
}
