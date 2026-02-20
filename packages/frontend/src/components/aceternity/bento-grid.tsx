/**
 * BentoGrid Component (Aceternity UI-inspired)
 * 
 * Modern bento-style grid layout for feature cards
 * Responsive grid with hover effects
 */

"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

interface BentoGridItemProps {
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
  gradient?: string;
}

export function BentoGrid({ children, className = "" }: BentoGridProps) {
  return (
    <div className={`grid grid-cols-1 gap-4 w-full ${className}`}>
      {children}
    </div>
  );
}

export function BentoGridItem({
  title,
  description,
  icon,
  className = "",
  gradient = "from-primary/20 to-violet-500/10",
}: BentoGridItemProps) {
  return (
    <motion.div
      className={`relative overflow-hidden group ${className}`}
      style={{
        background: "linear-gradient(145deg, rgba(24, 24, 27, 0.95), rgba(24, 24, 27, 0.8))",
        border: "1px solid rgba(39, 39, 42, 0.8)",
        borderRadius: "20px",
        padding: "16px",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
      whileHover={{
        scale: 1.02,
        x: 4,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Hover glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-[20px]"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(204, 255, 0, 0.05), transparent)",
          opacity: 0,
        }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-center gap-4">
        {/* Icon */}
        <div
          className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3
            className="text-[13px] font-semibold leading-tight"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: "#FFFFFF",
            }}
          >
            {title}
          </h3>
          <p
            className="text-[11px] mt-0.5"
            style={{
              fontFamily: "'Inter', sans-serif",
              color: "#71717A",
            }}
          >
            {description}
          </p>
        </div>

        {/* Arrow indicator */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(113, 113, 122, 0.4)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flex-shrink-0 group-hover:stroke-[rgba(113,113,122,0.8)] transition-colors"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </motion.div>
  );
}
