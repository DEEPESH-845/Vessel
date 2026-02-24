"use client";

import { useDemoStore } from "@/store/demo-store";
import { motion } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";

export function InteractivePaymentSimulation() {
  const { currentStep, simulatePayment, resetDemo } = useDemoStore();
  const isPlaying = currentStep !== 'idle' && currentStep !== 'complete';

  return (
    <div className="card-cinematic p-6 relative overflow-hidden group">
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold tracking-tight mb-2 text-white">
          AWS Infra Proof of Work
        </h2>
        <p className="text-sm text-white/50 mb-8 max-w-md mx-auto">
          Execute a simulated transaction traversing the zero-trust KMS perimeter, Bedrock risk assessment, and Lisk deterministic settlement.
        </p>

        {currentStep === 'idle' || currentStep === 'complete' ? (
          <button
            onClick={currentStep === 'complete' ? resetDemo : simulatePayment}
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-void rounded-full font-bold text-sm tracking-widest uppercase hover:scale-105 transition-transform"
          >
            {currentStep === 'complete' ? (
              <>
                <RotateCcw className="w-4 h-4" /> Reset Simulation
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-void" /> Execute Payment
              </>
            )}
            <div className="absolute inset-0 rounded-full ring-2 ring-white/20 ring-offset-2 ring-offset-void opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border-b-2 border-primary animate-spin" />
            <span className="text-xs font-mono uppercase tracking-widest text-primary animate-pulse">
              Processing: {currentStep}
            </span>
          </div>
        )}
      </div>

      {/* Interactive Background Elements */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent z-0 pointer-events-none"
        animate={{ 
          opacity: isPlaying ? [0.2, 0.5, 0.2] : 0 
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
}
