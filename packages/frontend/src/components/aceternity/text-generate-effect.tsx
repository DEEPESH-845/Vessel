/**
 * TextGenerateEffect Component (Aceternity UI-inspired)
 * 
 * Animates text with a typewriter/generate effect
 * Words appear one by one with smooth transitions
 */

"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface TextGenerateEffectProps {
  words: string;
  className?: string;
  duration?: number;
  delay?: number;
}

export default function TextGenerateEffect({
  words,
  className = "",
  duration = 0.5,
  delay = 0,
}: TextGenerateEffectProps) {
  const [mounted, setMounted] = useState(false);
  const wordsArray = words.split(" ");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={className}>{words}</div>;
  }

  return (
    <div className={className}>
      {wordsArray.map((word, idx) => (
        <motion.span
          key={word + idx}
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{
            duration,
            delay: delay + idx * 0.08,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}
