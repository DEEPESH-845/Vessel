/**
 * Spotlight Component (Aceternity UI-inspired)
 * 
 * Creates a spotlight effect that follows the mouse cursor
 * Premium visual effect for hero sections
 */

"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

export default function Spotlight() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const spotlightX = useTransform(mouseX, (value) => `${value}px`);
  const spotlightY = useTransform(mouseY, (value) => `${value}px`);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          left: spotlightX,
          top: spotlightY,
          x: "-50%",
          y: "-50%",
          background:
            "radial-gradient(circle, rgba(204, 255, 0, 0.15), rgba(99, 102, 241, 0.1) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
    </div>
  );
}
