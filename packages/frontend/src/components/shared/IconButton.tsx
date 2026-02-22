"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface IconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  className?: string;
  size?: number;
}

/**
 * IconButton — Circular dark pill button
 * 
 * Shape: 40×40px circle
 * Background: var(--bg-elevated)
 * Border: 1px var(--border-subtle)
 * Hover: border becomes accent-blue, subtle scale(1.05)
 * Icon color: var(--accent-cyan) or var(--text-secondary)
 * Active state: filled accent-blue background
 */
export function IconButton({
  icon,
  onClick,
  active = false,
  className,
  size = 40,
}: IconButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative flex items-center justify-center rounded-full",
        "transition-all duration-200 ease-smooth",
        active
          ? "bg-[var(--color-accent-blue)] border-[var(--color-accent-blue)]"
          : "bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)]",
        "hover:border-[var(--color-accent-blue)]",
        className
      )}
      style={{
        width: size,
        height: size,
      }}
    >
      <span
        className={cn(
          "transition-colors duration-200",
          active ? "text-white" : "text-[var(--accent-cyan)]"
        )}
      >
        {icon}
      </span>
    </motion.button>
  );
}
