"use client";

import { useDemoStore } from "@/store/demo-store";
import { motion } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";

// Import new premium GSAP microinteractions
import { useTiltEffect } from "@/hooks/useTiltEffect";
import { useMagnetic } from "@/hooks/useMagnetic";

export function InteractivePaymentSimulation() {
  const { currentStep, simulatePayment, resetDemo } = useDemoStore();
  const isPlaying = currentStep !== 'idle' && currentStep !== 'complete';

  // Attach the 3D tilt effect to the wrapper card
  const cardRef = useTiltEffect<HTMLDivElement>({ tiltIntensity: 15, scale: 1.01 });
  
  // Attach the magnetic effect to the main CTAs 
  const buttonRef = useMagnetic<HTMLButtonElement>({ strength: 25, tension: 0.8 });

  return (
    <div 
      ref={cardRef}
      className="card-cinematic p-8 md:p-10 relative overflow-hidden group w-full h-full flex flex-col items-center justify-center transition-shadow duration-500 hover:shadow-[0_0_100px_rgba(59,130,246,0.15)]"
    >
      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-xl mx-auto w-full">
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight mb-6 md:mb-8 text-white">
          AWS Infra Proof of Work
        </h3>
        
        <p className="text-base md:text-lg text-white/50 mb-8 md:mb-10 leading-relaxed font-light">
          Execute a simulated transaction traversing the zero-trust KMS perimeter, Bedrock risk assessment, and Lisk deterministic settlement.
        </p>

        {currentStep === 'idle' || currentStep === 'complete' ? (
          <button
            ref={buttonRef}
            onClick={currentStep === 'complete' ? resetDemo : simulatePayment}
            // Enhance button with inner glow classes
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-bg-void rounded-full font-bold text-sm tracking-widest uppercase transition-transform hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] will-change-transform z-20"
          >
            {currentStep === 'complete' ? (
              <>
                <RotateCcw className="w-5 h-5 transition-transform group-hover:-rotate-90 duration-500" /> Reset Simulation
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-bg-void transition-transform group-hover:scale-110 duration-500" /> Execute Payment
              </>
            )}
            <div className="absolute inset-0 rounded-full ring-2 ring-white/20 ring-offset-2 ring-offset-void opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ) : (
          <div className="flex flex-col items-center gap-4 py-4 auth-node">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-b-2 border-primary animate-spin" />
            <span className="text-sm font-mono uppercase tracking-widest text-primary animate-pulse">
              Processing: {currentStep}
            </span>
          </div>
        )}
      </div>

      {/* Interactive Background Elements mapped to execution state */}
      <motion.div 
        className="engine-glow absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent z-0 pointer-events-none"
        animate={{ 
          opacity: isPlaying ? [0.3, 0.6, 0.3] : 0 
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
}
