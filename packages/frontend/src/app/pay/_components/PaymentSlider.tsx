/**
 * PremiumSlideToPay Component
 * 
 * Enhanced slider with fluid animation, magnetic snap, and progress trail
 */

"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useState, useCallback, useEffect } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

interface PremiumSlideToPayProps {
  onComplete: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export default function PremiumSlideToPay({ 
  onComplete, 
  disabled,
  isLoading 
}: PremiumSlideToPayProps) {
  const [completed, setCompleted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);

  const trackWidth = 340;
  const thumbSize = 60;
  const threshold = trackWidth - thumbSize - 16;

  // Motion transforms
  const progressWidth = useTransform(
    x,
    [0, threshold],
    [thumbSize + 16, trackWidth]
  );
  
  const progressOpacity = useTransform(
    x,
    [0, threshold * 0.3, threshold],
    [0.1, 0.35, 0.7]
  );
  
  const textOpacity = useTransform(x, [0, threshold * 0.15], [1, 0]);
  const thumbScale = useTransform(
    x,
    [0, threshold * 0.5, threshold],
    [1, 1.08, 1]
  );
  
  const iconRotate = useTransform(x, [threshold * 0.4, threshold], [0, 180]);
  
  const thumbGlow = useTransform(
    x,
    [0, threshold * 0.5, threshold],
    [
      "0 2px 12px rgba(99,102,241,0.25), 0 0 0 2px rgba(99,102,241,0.08)",
      "0 4px 24px rgba(99,102,241,0.35), 0 0 0 3px rgba(99,102,241,0.15)",
      "0 6px 32px rgba(34,197,94,0.4), 0 0 0 4px rgba(34,197,94,0.2)",
    ]
  );

  // Trail particles
  const trailParticles = useTransform(
    x,
    [0, threshold],
    ["0px", `${threshold}px`]
  );

  const handleDragEnd = useCallback(() => {
    const currentX = x.get();
    if (currentX >= threshold * 0.8) {
      // Success - animate to end
      animate(x, threshold, { type: "spring", stiffness: 300, damping: 25 });
      setCompleted(true);
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      setTimeout(() => onComplete(), 400);
    } else {
      // Snap back
      animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
    }
    setIsDragging(false);
  }, [x, threshold, onComplete]);

  const handleDragStart = () => {
    setIsDragging(true);
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  // Reset on unmount
  useEffect(() => {
    return () => {
      x.set(0);
      setCompleted(false);
    };
  }, [x]);

  return (
    <div
      role="slider"
      aria-label="Slide to confirm payment"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round((x.get() / threshold) * 100)}
      tabIndex={0}
      className="relative"
    >
      {/* Track */}
      <div 
        className="h-[68px] rounded-2xl flex items-center relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, rgba(24, 24, 27, 0.9), rgba(24, 24, 27, 0.7))",
          border: "1px solid rgba(39, 39, 42, 0.8)",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        {/* Progress fill with gradient */}
        <motion.div
          className="absolute left-1.5 top-1.5 bottom-1.5 rounded-xl"
          style={{
            width: progressWidth,
            opacity: progressOpacity,
            background: "linear-gradient(90deg, rgba(99,102,241,0.3) 0%, rgba(34,197,94,0.25) 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        />

        {/* Animated trail lines */}
        <motion.div
          className="absolute left-1 top-0 bottom-0 w-0.5"
          style={{
            x: trailParticles,
            opacity: useTransform(x, [0, threshold * 0.3], [0, 0.3]),
            background: "linear-gradient(180deg, transparent, rgba(204,255,0,0.3), transparent)",
          }}
        />

        {/* Label text */}
        <motion.span
          className="absolute inset-0 flex items-center justify-center text-[15px] font-semibold pointer-events-none select-none"
          style={{ opacity: textOpacity }}
        >
          <span 
            style={{ 
              color: "#A1A1AA",
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: "0.02em",
            }}
          >
            {completed || isLoading ? "Processing..." : "Slide to pay"}
          </span>
          {!completed && !isLoading && (
            <motion.span
              style={{ color: "#52525B", marginLeft: "8px" }}
              animate={{ x: [0, 6, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              →
            </motion.span>
          )}
        </motion.span>

        {/* Draggable thumb */}
        <motion.div
          className="absolute left-1.5 z-10 rounded-xl flex items-center justify-center cursor-grab"
          drag={disabled || completed || isLoading ? false : "x"}
          dragConstraints={{ left: 0, right: threshold }}
          dragElastic={0}
          dragMomentum={false}
          style={{ 
            x, 
            scale: thumbScale,
            boxShadow: thumbGlow,
            width: thumbSize,
            height: "calc(100% - 12px)",
            background: completed || isLoading
              ? "linear-gradient(135deg, #22c55e, #16a34a)"
              : "linear-gradient(135deg, #6366f1, #4f46e5)",
          }}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
          whileTap={!completed ? { scale: 1.05 } : undefined}
          whileHover={!completed ? { scale: 1.02 } : undefined}
        >
          {/* Inner glow */}
          <motion.div
            className="absolute inset-0 rounded-xl opacity-30"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.2), transparent)",
            }}
          />
          
          {/* Icon */}
          <motion.div style={{ rotate: iconRotate }} className="relative z-10">
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-5 h-5 text-white" strokeWidth={2.5} />
              </motion.div>
            ) : completed ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Check className="w-5 h-5 text-white" strokeWidth={3} />
              </motion.div>
            ) : (
              <ArrowRight className="w-5 h-5 text-white" strokeWidth={2.5} />
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Security text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-xs mt-3 flex items-center justify-center gap-1.5"
        style={{ color: "#52525B" }}
      >
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Secured by Vessel • ERC-4337
      </motion.p>
    </div>
  );
}
