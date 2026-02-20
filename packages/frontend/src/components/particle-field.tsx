/**
 * ParticleField Component
 * 
 * Ambient particle system for background visual enhancement
 * Creates floating particles with physics-based motion
 */

"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

interface ParticleFieldProps {
  count?: number;
  color?: string;
}

export default function ParticleField({ 
  count = 20, 
  color = "rgba(204, 255, 0, 0.2)" 
}: ParticleFieldProps) {
  // Generate particles with random properties
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 3 + 3,
      delay: Math.random() * 2,
      opacity: Math.random() * 0.3 + 0.1,
    }));
  }, [count]);

  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden" 
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            background: color,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            filter: "blur(1px)",
          }}
          animate={{
            y: [-30, 30, -30],
            x: [-10, 10, -10],
            opacity: [0, particle.opacity, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
