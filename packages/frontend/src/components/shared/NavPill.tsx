"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavPillProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * NavPill — Top navigation pill (used in both screens)
 * 
 * Background: rgba(11, 20, 34, 0.7) with blur
 * Border-radius: 999px
 * Padding: 8px 20px
 * Text: font-body 14px text-secondary
 * Hover: text becomes text-primary, faint glow
 */
export function NavPill({ children, active = false, onClick, className }: NavPillProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative px-5 py-2 rounded-full text-sm font-medium",
        "transition-all duration-200 ease-smooth",
        "bg-[rgba(11,20,34,0.7)] backdrop-blur-md",
        active
          ? "text-[var(--color-text-primary)] shadow-[0_0_20px_rgba(59,130,246,0.2)]"
          : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
        className
      )}
    >
      {children}
      {active && (
        <motion.div
          layoutId="navPill"
          className="absolute inset-0 rounded-full border border-[var(--color-accent-blue)]"
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </motion.button>
  );
}
