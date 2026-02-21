/**
 * MovingBorder Component (Aceternity UI-inspired)
 * 
 * Button with animated moving border effect
 * Creates a glowing border that moves around the button
 */

"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface MovingBorderProps {
  children: ReactNode;
  duration?: number;
  className?: string;
  containerClassName?: string;
  borderClassName?: string;
  onClick?: () => void;
}

export default function MovingBorder({
  children,
  duration = 2000,
  className = "",
  containerClassName = "",
  borderClassName = "",
  onClick,
}: MovingBorderProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`relative p-[1px] overflow-hidden ${containerClassName}`}
      style={{
        borderRadius: "16px",
      }}
    >
      {/* Animated border */}
      <motion.div
        className={`absolute inset-0 ${borderClassName}`}
        style={{
          background: "linear-gradient(90deg, #CCFF00, #6366f1, #8b5cf6, #CCFF00)",
          backgroundSize: "400% 100%",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: duration / 1000,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Content */}
      <div
        className={`relative bg-[#0A0A0A] rounded-[15px] ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
