"use client";

import { useDemoStore } from "@/store/demo-store";
import { motion } from "framer-motion";
import { useMagnetic } from "@/hooks/useMagnetic";

export function DemoToggle() {
  const { isDemoMode, toggleDemoMode } = useDemoStore();
  
  // Attach magnet logic to make the toggle sticky to the pointer
  const toggleRef = useMagnetic<HTMLDivElement>({ strength: 15, tension: 0.8 });

  return (
    <div 
      ref={toggleRef}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-void/80 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 shadow-2xl transition-all duration-300 hover:border-white/20 will-change-transform"
    >
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
          isDemoMode ? "bg-accent-cyan/20 border-accent-cyan/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "bg-neon-green/20 border-neon-green/50 shadow-[0_0_15px_rgba(74,222,128,0.3)]"
        } border hover:scale-105`}
      >
        <motion.div
          animate={{ x: isDemoMode ? 24 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`absolute top-[1px] left-0 w-5 h-5 rounded-full shadow-sm ${
            isDemoMode ? "bg-accent-cyan" : "bg-neon-green"
          }`}
        />
      </button>
    </div>
  );
}
