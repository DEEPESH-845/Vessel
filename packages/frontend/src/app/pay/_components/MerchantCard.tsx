/**
 * PremiumMerchantCard Component
 * 
 * Hero merchant display with 3D tilt effect, animated borders, and shimmer
 */

"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import { useRef } from "react";

interface PremiumMerchantCardProps {
  name: string;
  address: string;
  avatar: string;
  verified: boolean;
}

export default function PremiumMerchantCard({
  name,
  address,
  avatar,
  verified,
}: PremiumMerchantCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // 3D Tilt Effect
  const mouseX = useSpring(0, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(0, { stiffness: 500, damping: 100 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    mouseX.set((x - centerX) / 10);
    mouseY.set((y - centerY) / 10);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const rotateX = useMotionTemplate`${mouseY}deg`;
  const rotateY = useMotionTemplate`${-mouseX}deg`;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: 0.2,
        ease: [0.21, 0.47, 0.32, 0.98] 
      }}
      style={{ perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative"
    >
      {/* Animated gradient border */}
      <motion.div
        className="absolute -inset-[1px] rounded-[21px] opacity-70"
        style={{
          background: "linear-gradient(135deg, #6366f1, #8b5cf6, #06d6a0, #CCFF00, #6366f1)",
          backgroundSize: "400% 100%",
          filter: "blur(8px)",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear",
        }}
        aria-hidden="true"
      />

      {/* Card Background */}
      <motion.div
        className="relative rounded-[20px] overflow-hidden"
        style={{
          background: "linear-gradient(145deg, rgba(24, 24, 27, 0.95), rgba(24, 24, 27, 0.85))",
          border: "1px solid rgba(39, 39, 42, 0.8)",
          transform: `rotateX(${rotateX}) rotateY(${rotateY})`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Shimmer overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
          }}
          animate={{
            backgroundPosition: ["0% 0%", "200% 0%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative p-6" style={{ transform: "translateZ(20px)" }}>
          {/* Merchant Avatar */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-16 h-16 rounded-[18px] flex items-center justify-center mb-5 mx-auto"
            style={{
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.15))",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              boxShadow: "0 8px 32px rgba(99, 102, 241, 0.15)",
            }}
          >
            <span className="text-3xl">{avatar}</span>
          </motion.div>

          {/* Merchant Info */}
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-2 mb-1"
            >
              <h2
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#FFFFFF",
                }}
              >
                {name}
              </h2>
              {verified && (
                <BadgeCheck
                  className="w-5 h-5"
                  style={{ color: "#CCFF00" }}
                  aria-label="Verified merchant"
                />
              )}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "12px",
                color: "#52525B",
              }}
            >
              {address.slice(0, 6)}...{address.slice(-4)}
            </motion.p>
          </div>
        </div>

        {/* Ambient glow */}
        <motion.div
          className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%)",
            filter: "blur(20px)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          aria-hidden="true"
        />
      </motion.div>
    </motion.div>
  );
}
