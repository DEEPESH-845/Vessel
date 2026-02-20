/**
 * AnimatedWrapper Component
 * 
 * Provides scroll-triggered and entrance animations for child components
 * Uses Framer Motion for smooth, spring-based animations
 */

"use client";

import { motion, useInView, Variants } from "framer-motion";
import { useRef, ReactNode } from "react";

interface AnimatedWrapperProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
}

const variants: Record<string, Variants> = {
  up: {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    visible: { opacity: 1, y: 0, scale: 1 },
  },
  down: {
    hidden: { opacity: 0, y: -24, scale: 0.96 },
    visible: { opacity: 1, y: 0, scale: 1 },
  },
  left: {
    hidden: { opacity: 0, x: 24, scale: 0.96 },
    visible: { opacity: 1, x: 0, scale: 1 },
  },
  right: {
    hidden: { opacity: 0, x: -24, scale: 0.96 },
    visible: { opacity: 1, x: 0, scale: 1 },
  },
};

export default function AnimatedWrapper({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: AnimatedWrapperProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants[direction]}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
