"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { useState, useCallback } from "react";

interface SlideToPayProps {
  onComplete: () => void;
  disabled?: boolean;
}

export default function SlideToPay({ onComplete, disabled }: SlideToPayProps) {
  const [completed, setCompleted] = useState(false);
  const x = useMotionValue(0);

  const trackWidth = 320;
  const thumbSize = 56;
  const threshold = trackWidth - thumbSize - 12;

  const progressWidth = useTransform(
    x,
    [0, threshold],
    [thumbSize + 12, trackWidth]
  );
  const progressOpacity = useTransform(
    x,
    [0, threshold * 0.4, threshold],
    [0.1, 0.3, 0.6]
  );
  const textOpacity = useTransform(x, [0, threshold * 0.2], [1, 0]);
  const iconRotate = useTransform(x, [threshold * 0.6, threshold], [0, 360]);
  const thumbGlow = useTransform(
    x,
    [0, threshold],
    [
      "0 2px 8px rgba(99,102,241,0.2), 0 0 0 2px rgba(99,102,241,0.06)",
      "0 4px 20px rgba(6,214,160,0.3), 0 0 0 4px rgba(6,214,160,0.12)",
    ]
  );

  const handleDragEnd = useCallback(() => {
    const currentX = x.get();
    if (currentX >= threshold * 0.82) {
      animate(x, threshold, { type: "spring", stiffness: 300, damping: 30 });
      setCompleted(true);
      setTimeout(() => onComplete(), 350);
    } else {
      animate(x, 0, { type: "spring", stiffness: 500, damping: 35 });
    }
  }, [x, threshold, onComplete]);

  return (
    <div
      className="relative"
      role="slider"
      aria-label="Slide to confirm payment"
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
    >
      {/* Track */}
      <div 
        className="h-16 rounded-2xl flex items-center relative overflow-hidden"
        style={{
          background: "rgba(24, 24, 27, 0.8)",
          border: "1px solid rgba(39, 39, 42, 0.6)",
          width: trackWidth,
        }}
      >
        {/* Progress fill */}
        <motion.div
          className="absolute left-1 top-1 bottom-1 rounded-[18px]"
          style={{
            width: progressWidth,
            opacity: progressOpacity,
            background: "linear-gradient(90deg, rgba(99,102,241,0.2), rgba(6,214,160,0.15))",
          }}
        />

        {/* Label text */}
        <motion.span
          className="absolute inset-0 flex items-center justify-center text-[14px] font-medium pointer-events-none select-none"
          style={{ opacity: textOpacity }}
        >
          <span style={{ color: "#A1A1AA" }}>
            {completed ? "Sending..." : "Slide to pay"}
          </span>
          {!completed && (
            <motion.span
              style={{ color: "#52525B", marginLeft: "6px" }}
              animate={{ x: [0, 4, 0] }}
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
          className="absolute left-1.5 z-10 rounded-xl flex items-center justify-center"
          drag={disabled || completed ? false : "x"}
          dragConstraints={{ left: 0, right: threshold }}
          dragElastic={0}
          dragMomentum={false}
          style={{ 
            x, 
            boxShadow: thumbGlow,
            width: thumbSize,
            height: "calc(100% - 12px)",
            background: completed 
              ? "linear-gradient(135deg, #22c55e, #16a34a)"
              : "linear-gradient(135deg, #6366f1, #4f46e5)",
          }}
          onDragEnd={handleDragEnd}
          whileTap={!completed ? { scale: 1.05 } : undefined}
        >
          <motion.div style={{ rotate: iconRotate }}>
            {completed ? (
              <Check className="w-5 h-5 text-white" strokeWidth={3} />
            ) : (
              <ArrowRight className="w-5 h-5 text-white" strokeWidth={2.5} />
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
