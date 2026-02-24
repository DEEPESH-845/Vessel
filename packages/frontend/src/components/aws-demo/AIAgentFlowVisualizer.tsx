"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useDemoStore, DemoStep } from "@/store/demo-store";
import { Network, DatabaseZap, Cpu, Globe2, ArrowRight } from "lucide-react";

const STEPS: DemoStep[] = ['idle', 'auth', 'ai-risk', 'gas-prediction', 'swap', 'settlement', 'complete'];

export function AIAgentFlowVisualizer() {
  const { currentStep } = useDemoStore();
  const stepIndex = STEPS.indexOf(currentStep);

  const nodes = useMemo(() => [
    { id: "sdk", label: "Client SDK", icon: Cpu, stepThreshold: 1 },
    { id: "auth", label: "KMS Auth", icon: Globe2, stepThreshold: 1 },
    { id: "ai", label: "Bedrock Risk", icon: Network, stepThreshold: 2 },
    { id: "gas", label: "Gas Oracle", icon: DatabaseZap, stepThreshold: 3 },
    { id: "swap", label: "DEX Router", icon: ArrowRight, stepThreshold: 4 },
    { id: "settle", label: "Settler", icon: Globe2, stepThreshold: 5 },
  ], []);

  return (
    // SPACING FIX: standardized `p-6` card padding ensuring grid items align, fixed internal heights
    <div className="card-cinematic p-6 md:p-8 relative overflow-hidden group w-full h-full flex flex-col justify-between min-h-[300px]">
      {/* Background Glow */}
      <div 
        className={`absolute -inset-10 bg-primary/10 blur-[100px] rounded-full transition-opacity duration-1000 ${
          stepIndex >= 2 ? "opacity-100" : "opacity-0"
        } pointer-events-none`}
      />

      {/* SPACING FIX: Standardization header `mb-8` */}
      <div className="relative z-10 flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Network className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          <h3 className="text-base md:text-lg font-medium tracking-tight text-white/90">Autonomous Tx Router</h3>
        </div>
      </div>

      <div className="relative flex justify-between items-center w-full px-4 md:px-8 mt-auto mb-auto">
        {/* Connecting Lines */}
        <div className="absolute top-1/2 left-8 right-8 h-px bg-white/10 -translate-y-1/2 z-0" />
        
        {/* Animated Progress Line */}
        <motion.div 
          className="absolute top-1/2 left-8 h-px bg-gradient-to-r from-primary via-accent-cyan to-neon-green -translate-y-1/2 z-0 origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: stepIndex > 0 ? (stepIndex - 1) / 4 : 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />

        {nodes.map((node, i) => {
          const isActive = stepIndex >= node.stepThreshold;
          const isCurrent = stepIndex === node.stepThreshold;
          
          return (
            // SPACING FIX: Component internal gap spacing `gap-4`
            <div key={node.id} className="relative z-10 flex flex-col items-center gap-4">
              <motion.div 
                className={`w-10 h-10 md:w-14 md:h-14 rounded-xl flex items-center justify-center border backdrop-blur-md transition-colors duration-500 relative ${
                  isActive ? "bg-white/10 border-white/30 text-white shadow-lg" : "bg-void border-white/5 text-white/30"
                }`}
                animate={isCurrent ? { 
                  boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)",
                  borderColor: "rgba(255, 255, 255, 0.5)"
                } : {
                  boxShadow: "none",
                }}
              >
                <node.icon className={`w-4 h-4 md:w-6 md:h-6 ${isCurrent ? "animate-pulse text-neon-green" : ""}`} />
                
                {isCurrent && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 rounded-xl border border-primary pointer-events-none"
                  />
                )}
              </motion.div>
              <span className={`text-[10px] md:text-xs font-mono uppercase tracking-widest text-center max-w-[80px] leading-tight ${
                isActive ? "text-white/80" : "text-white/30"
              }`}>
                {node.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
