/**
 * ScrollProgress Component
 * 
 * Visual indicator showing scroll progress through the page
 * Uses Framer Motion for smooth animations
 */

"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 z-50 origin-left"
      style={{
        scaleX,
        background: "linear-gradient(90deg, #CCFF00, #22c55e)",
        boxShadow: "0 0 10px rgba(204, 255, 0, 0.5)",
      }}
      aria-hidden="true"
    />
  );
}
