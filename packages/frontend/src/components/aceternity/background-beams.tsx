/**
 * BackgroundBeams Component (Aceternity UI-inspired)
 * 
 * Animated background beams effect
 * Creates dynamic light beams in the background
 */

"use client";

import { motion } from "framer-motion";

export default function BackgroundBeams() {
  const beams = [
    { delay: 0, duration: 7, x: "10%", width: "2px" },
    { delay: 2, duration: 8, x: "30%", width: "3px" },
    { delay: 4, duration: 6, x: "50%", width: "2px" },
    { delay: 1, duration: 9, x: "70%", width: "3px" },
    { delay: 3, duration: 7, x: "90%", width: "2px" },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {beams.map((beam, idx) => (
        <motion.div
          key={idx}
          className="absolute top-0 bottom-0"
          style={{
            left: beam.x,
            width: beam.width,
            background: "linear-gradient(180deg, transparent, rgba(204, 255, 0, 0.3), transparent)",
          }}
          initial={{ y: "-100%", opacity: 0 }}
          animate={{
            y: ["100%", "-100%"],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: beam.duration,
            delay: beam.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
