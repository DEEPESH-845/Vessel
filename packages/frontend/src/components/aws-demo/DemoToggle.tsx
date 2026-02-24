"use client";

import { useDemoStore } from "@/store/demo-store";
import { motion } from "framer-motion";

export function DemoToggle() {
  const { isDemoMode, toggleDemoMode } = useDemoStore();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-void/80 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 shadow-2xl">
      <div className="flex flex-col items-end mr-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-white/70">
          Environment
        </span>
        <span className={`text-xs font-medium tracking-tight ${isDemoMode ? "text-accent-cyan" : "text-neon-green"}`}>
          {isDemoMode ? "AWS JUDGE DEMO" : "LIVE MAINNET"}
        </span>
      </div>
      
      <button
        onClick={toggleDemoMode}
        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
          isDemoMode ? "bg-accent-cyan/20 border-accent-cyan/50" : "bg-neon-green/20 border-neon-green/50"
        } border`}
      >
        <motion.div
          animate={{ x: isDemoMode ? 24 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`absolute top-0.5 left-0 w-4 h-4 rounded-full shadow-sm ${
            isDemoMode ? "bg-accent-cyan" : "bg-neon-green"
          }`}
        />
      </button>
    </div>
  );
}
