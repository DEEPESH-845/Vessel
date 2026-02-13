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

  const trackWidth = 300;
  const thumbSize = 60;
  const threshold = trackWidth - thumbSize - 8;

  const progressWidth = useTransform(
    x,
    [0, threshold],
    [thumbSize + 8, trackWidth]
  );
  const progressOpacity = useTransform(
    x,
    [0, threshold * 0.4, threshold],
    [0.15, 0.4, 0.8]
  );
  const textOpacity = useTransform(x, [0, threshold * 0.25], [1, 0]);
  const iconRotate = useTransform(x, [threshold * 0.7, threshold], [0, 360]);
  const thumbGlow = useTransform(
    x,
    [0, threshold],
    [
      "0 4px 16px rgba(99,102,241,0.3), 0 0 0 4px rgba(99,102,241,0.08)",
      "0 4px 24px rgba(6,214,160,0.4), 0 0 0 6px rgba(6,214,160,0.15)",
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
      className="relative w-[300px] mx-auto"
      role="slider"
      aria-label="Slide to confirm payment"
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
    >
      <div className="slide-track h-[68px] flex items-center relative">
        {/* Progress fill with gradient */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 rounded-[60px]"
          style={{
            width: progressWidth,
            opacity: progressOpacity,
            background:
              "linear-gradient(90deg, rgba(99,102,241,0.25), rgba(6,214,160,0.2))",
          }}
        />

        {/* Label text */}
        <motion.span
          className="absolute inset-0 flex items-center justify-center text-[13px] font-medium pointer-events-none select-none"
          style={{ opacity: textOpacity }}
        >
          <span className="text-muted-foreground/60">
            {completed ? "Payment sent!" : "Slide to pay"}
          </span>
          {!completed && (
            <motion.span
              className="ml-1.5 text-muted-foreground/40"
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
          className="slide-thumb absolute left-1 z-10"
          drag={disabled || completed ? false : "x"}
          dragConstraints={{ left: 0, right: threshold }}
          dragElastic={0}
          dragMomentum={false}
          style={{ x, boxShadow: thumbGlow }}
          onDragEnd={handleDragEnd}
          whileTap={!completed ? { scale: 1.08 } : undefined}
        >
          <motion.div style={{ rotate: iconRotate }}>
            {completed ? (
              <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
            ) : (
              <ArrowRight className="w-5 h-5 text-white" strokeWidth={2} />
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
