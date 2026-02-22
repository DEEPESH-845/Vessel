/**
 * PremiumBackground Component
 * 
 * Animated mesh gradient background with floating orbs for premium feel
 */

"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface PremiumBackgroundProps {
  children: React.ReactNode;
}

export default function PremiumBackground({ children }: PremiumBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Parallax transforms
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const backgroundOpacity = useTransform(scrollY, [0, 300], [1, 0.4]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-dvh overflow-hidden"
      style={{ background: "#0A0A0A" }}
    >
      {/* Base gradient */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          y: backgroundY,
          opacity: backgroundOpacity,
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99, 102, 241, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 10%, rgba(204, 255, 0, 0.03) 0%, transparent 40%),
            radial-gradient(ellipse 50% 30% at 10% 80%, rgba(139, 92, 246, 0.03) 0%, transparent 40%)
          `,
        }}
        aria-hidden="true"
      />

      {/* Floating orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Orb 1 - Purple */}
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]"
          style={{
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.4), transparent 70%)",
            top: "10%",
            right: "-10%",
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Orb 2 - Indigo */}
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full opacity-10 blur-[80px]"
          style={{
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.4), transparent 70%)",
            top: "30%",
            left: "-5%",
          }}
          animate={{
            x: [0, -30, 0],
            y: [0, 40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        {/* Orb 3 - Neon Green accent */}
        <motion.div
          className="absolute w-[250px] h-[250px] rounded-full opacity-8 blur-[60px]"
          style={{
            background: "radial-gradient(circle, rgba(204, 255, 0, 0.3), transparent 70%)",
            bottom: "20%",
            right: "20%",
          }}
          animate={{
            x: [0, 40, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />
      </div>

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          mixBlendMode: "overlay",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
