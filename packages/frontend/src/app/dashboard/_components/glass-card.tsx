"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export function GlassCard({
  children,
  className,
  hover = true,
  padding = "lg",
}: GlassCardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-5",
    lg: "p-6",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={cn(
        "relative rounded-2xl",
        "bg-[rgba(20,24,40,0.65)]",
        "backdrop-blur-xl",
        "border border-[rgba(255,255,255,0.06)]",
        "shadow-[0_4px_30px_rgba(0,0,0,0.12)]",
        paddingClasses[padding],
        hover && "transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_40px_rgba(79,124,255,0.1)] hover:border-[rgba(255,255,255,0.1)]",
        className
      )}
    >
      {/* Subtle gradient border effect */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(79,124,255,0.08) 0%, transparent 50%, rgba(124,77,255,0.08) 100%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

export function GradientBorderCard({
  children,
  className,
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl p-[1px]",
        "bg-gradient-to-br from-[rgba(79,124,255,0.3)] via-transparent to-[rgba(124,77,255,0.3)]",
        hover && "transition-transform duration-300 hover:scale-[1.02]",
        className
      )}
    >
      <div
        className={cn(
          "relative rounded-[15px]",
          "bg-[rgba(20,24,40,0.8)]",
          "backdrop-blur-xl",
          "border border-[rgba(255,255,255,0.04)]",
          "h-full"
        )}
      >
        {children}
      </div>
    </div>
  );
}
