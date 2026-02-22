/**
 * MagneticActionButton Component
 * 
 * Enhanced action button with magnetic cursor following and premium interactions
 * Wraps existing QuickActionsGrid buttons with motion effects
 */

"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef, MouseEvent } from "react";

interface MagneticActionButtonProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  delay?: number;
}

export default function MagneticActionButton({
  href,
  icon,
  label,
  delay = 0,
}: MagneticActionButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  
  // Mouse position tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring physics for smooth following
  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  // Transform for magnetic effect
  const rotateX = useTransform(y, [-0.5, 0.5], ["2deg", "-2deg"]);
  const rotateY = useTransform(x, [-0.5, 0.5], ["-2deg", "2deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distanceX = (e.clientX - centerX) / (rect.width / 2);
    const distanceY = (e.clientY - centerY) / (rect.height / 2);
    
    mouseX.set(distanceX * 0.3);
    mouseY.set(distanceY * 0.3);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
    >
      <Link
        ref={ref}
        href={href}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative overflow-hidden block"
        style={{ textDecoration: "none" }}
      >
        <motion.div
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div
            className="relative"
            style={{
              background: "linear-gradient(145deg, rgba(14, 19, 32, 0.95), rgba(14, 19, 32, 0.8))",
              border: "1px solid rgba(59, 130, 246, 0.15)",
              borderRadius: "24px",
              padding: "24px",
              minHeight: "120px",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(255, 255, 255, 0.05) inset",
            }}
          >
            {/* Magnetic glow that follows cursor */}
            <motion.div
              className="absolute inset-0 pointer-events-none rounded-3xl"
              style={{
                background: `radial-gradient(circle at ${useTransform(x, [-0.5, 0.5], ["30%", "70%"]).get()} ${useTransform(y, [-0.5, 0.5], ["30%", "70%"]).get()}, rgba(59, 130, 246, 0.15), transparent 60%)`,
                opacity: 0,
              }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              aria-hidden="true"
            />

            {/* Glassmorphism overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                backdropFilter: "blur(24px) saturate(1.8)",
                WebkitBackdropFilter: "blur(24px) saturate(1.8)",
              }}
              aria-hidden="true"
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-3 h-full">
              {/* Icon container with enhanced animation */}
              <motion.div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(59, 130, 246, 0.15)",
                  border: "1px solid rgba(59, 130, 246, 0.25)",
                  boxShadow: "0 0 20px rgba(59, 130, 246, 0.15)",
                }}
                whileHover={{
                  scale: 1.1,
                  rotate: 5,
                  boxShadow: "0 0 30px rgba(59, 130, 246, 0.3)",
                }}
                whileTap={{ scale: 0.95, rotate: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  {icon}
                </motion.div>
              </motion.div>

              {/* Button text */}
              <motion.span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#FFFFFF",
                  letterSpacing: "-0.01em",
                  textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
                }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {label}
              </motion.span>
            </div>

            {/* Ripple effect on press */}
            <motion.div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(59, 130, 246, 0.2), transparent 70%)",
                opacity: 0,
              }}
              whileTap={{
                opacity: [0, 0.5, 0],
                scale: [0.8, 1.2, 1.4],
              }}
              transition={{ duration: 0.6 }}
              aria-hidden="true"
            />

            {/* Corner accent */}
            <div
              className="absolute bottom-0 right-0 w-16 h-16 opacity-10 pointer-events-none"
              style={{
                background: "radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.3), transparent 70%)",
              }}
              aria-hidden="true"
            />
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
