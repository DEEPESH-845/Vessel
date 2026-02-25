"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/landing/Navbar";
import { HeroMesh } from "@/components/fintech/HeroMesh";
import { ProblemSolution } from "@/components/fintech/ProblemSolution";
import { useSectionReveal } from "@/hooks/useSectionReveal";

// High-Fidelity Interactive Components
import { InteractivePaymentSimulation } from "@/components/aws-demo/InteractivePaymentSimulation";
import { SecurityTransparencyDrawer } from "@/components/aws-demo/SecurityTransparencyDrawer";
import { AIAgentFlowVisualizer } from "@/components/aws-demo/AIAgentFlowVisualizer";
import { AIFraudInsightPanel } from "@/components/aws-demo/AIFraudInsightPanel";
import { GasPredictionVisualizer } from "@/components/aws-demo/GasPredictionVisualizer";
import { RealTimeMerchantDashboard } from "@/components/aws-demo/RealTimeMerchantDashboard";

// Minimal Demo Toggle
import { DemoToggle } from "@/components/aws-demo/DemoToggle";

// Icons 
import { Sparkles, TerminalSquare, ShieldCheck, DatabaseZap, Network, Shield } from "lucide-react";

// Dynamically import smooth scroll
const SmoothScrollProvider = dynamic(
  () => import("@/components/smooth-scroll-provider").then((mod) => mod.SmoothScrollProvider),
  { ssr: false }
);
import { useInteractiveFlow } from "@/hooks/useInteractiveFlow";

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize the GSAP Interactive Master Orchestrator Event engine
  useInteractiveFlow();

  // Apply premium cinematic reveals to section components safely
  useSectionReveal(containerRef, ".hero-anim", {
    yOffset: 40,
    stagger: 0.15,
    delay: 0.2,
  });

  useSectionReveal(containerRef, ".cinematic-section", {
    yOffset: 60,
    duration: 1.2,
    triggerHook: "top 85%"
  });

  return (
    <SmoothScrollProvider>
      <main ref={containerRef} className="relative min-h-screen bg-[#0B0F17] text-white font-sans selection:bg-accent-cyan/30">
        
        <DemoToggle />
        <Navbar />

        {/* ========================================================= */}
        {/* SEC 1: HERO CINEMATIC (THE HOOK) */}
        {/* ========================================================= */}
        <section className="relative min-h-screen flex items-center py-16 md:py-24 lg:py-32 overflow-hidden">
          <HeroMesh />
          
          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12 grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            {/* Left Column: Copy & CTAs */}
            <div className="text-left w-full md:min-w-[480px]">
              <div className="hero-anim inline-flex items-center gap-2 px-4 py-2 mb-6 md:mb-8 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-mono text-white/60 tracking-widest uppercase">
                <Sparkles className="w-4 h-4 text-accent-cyan" />
                <span>Production-Ready Web3 Architecture</span>
              </div>

              <h1 className="hero-anim text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-tight mb-6 md:mb-8 max-w-4xl">
                Gasless Execution.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan via-white/90 to-accent-purple/60">
                  Infinite Scale.
                </span>
              </h1>

              <p className="hero-anim text-base md:text-lg text-white/50 max-w-xl font-light mb-8 md:mb-10 leading-relaxed tracking-wide">
                Vessel abstracts the friction of crypto via <span className="text-white/80 font-medium">ERC-4337</span> and <span className="text-80 font-medium">AWS Bedrock</span>. Zero gas limits. Instant deterministic settlement. Enterprise security.
              </p>

              <div className="hero-anim flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 w-full justify-start">
                <button 
                  className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-bg-void rounded-full font-bold text-sm tracking-widest uppercase transition-transform hover:scale-[1.03]"
                  onClick={() => {
                     document.getElementById('engine-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <TerminalSquare className="w-5 h-5 fill-bg-void" />
                  Initialize Simulation
                  <div className="absolute inset-0 rounded-full ring-2 ring-white/20 ring-offset-2 ring-offset-bg-void opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>

            {/* Right Column: Visual Anchor / Breathing Space */}
            <div className="hidden md:flex relative w-full h-[500px] items-center justify-center">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)] opacity-50 blur-3xl rounded-full pointer-events-none" />
               <div className="hero-anim relative w-64 h-64 lg:w-80 lg:h-80 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-[0_0_80px_rgba(59,130,246,0.1)] flex items-center justify-center">
                  <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full border border-white/10 bg-void shadow-inner flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-accent-cyan/20 animate-pulse blur-xl" />
                  </div>
               </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#0B0F17] to-transparent z-10 pointer-events-none" />
        </section>

        {/* ========================================================= */}
        {/* SEC 2: PROBLEM/SOLUTION (FRICTION DIAGNOSIS) */}
        {/* ========================================================= */}
        <section className="cinematic-section py-16 md:py-24 lg:py-32 border-b border-white/[0.02]">
           <ProblemSolution />
        </section>

        {/* ========================================================= */}
        {/* SEC 3: THE ENGINE (CENTRAL INTERACTIVE FOCAL POINT) */}
        {/* ========================================================= */}
        <section id="engine-section" className="cinematic-section py-16 md:py-24 lg:py-32 relative border-b border-white/[0.02] bg-[#0A0D13]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.03),transparent_70%)] pointer-events-none" />
          
          <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12 relative z-10">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start">
              
              <div className="text-left mb-12 md:mb-0">
                 <DatabaseZap className="w-10 h-10 md:w-12 md:h-12 text-accent-purple mb-6 md:mb-8 opacity-80" />
                 <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 md:mb-8 text-white max-w-4xl">
                   The Vessel Core Engine
                 </h2>
                 <p className="text-base md:text-lg text-white/60 font-light leading-relaxed mb-6 md:mb-8 max-w-2xl">
                   A fully autonomous cloud pipeline leveraging predictive ML for gas optimization and zero-trust perimeter defense. Execute a payload to visualize the sequence.
                 </p>
              </div>

              <div className="relative w-full flex justify-center md:justify-start">
                <div className="absolute -inset-4 bg-gradient-to-r from-accent-purple/20 via-primary/20 to-accent-cyan/20 blur-2xl opacity-40 rounded-[3rem] pointer-events-none" />
                <div className="bg-bg-elevated/80 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl relative min-h-[450px] w-full">
                   <InteractivePaymentSimulation />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SEC 4: SECURITY LAYER (KMS TRANSPARENCY) */}
        {/* ========================================================= */}
        <section className="cinematic-section py-16 md:py-24 lg:py-32 relative border-b border-white/[0.02]">
           <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12 relative z-10">
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start">
                 <div className="text-left mb-12 md:mb-0">
                    <Shield className="w-8 h-8 md:w-10 md:h-10 text-accent-cyan mb-6 md:mb-8" />
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 md:mb-8 text-white max-w-4xl">
                      Zero-Trust Perimeter
                    </h2>
                    <p className="text-base md:text-lg text-white/60 font-light leading-relaxed mb-6 md:mb-8 max-w-2xl">
                       Every transaction is wrapped in an ERC-4337 UserOperation. AWS KMS generates ephemeral signers via federated enclaves, completely eliminating the need for user seed phrases.
                    </p>
                 </div>
                 <div className="w-full flex justify-center md:justify-start">
                    <div className="bg-bg-elevated/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl w-full">
                       <SecurityTransparencyDrawer />
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* ========================================================= */}
        {/* SEC 5: AI INTELLIGENCE & ROUTING */}
        {/* ========================================================= */}
        <section className="cinematic-section py-16 md:py-24 lg:py-32 relative border-b border-white/[0.02] bg-[#0A0D13]">
           <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12 relative z-10">
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start mb-12 md:mb-16">
                 <div className="text-left">
                    <Network className="w-8 h-8 md:w-10 md:h-10 text-neon-green mb-6 md:mb-8" />
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 md:mb-8 text-white max-w-4xl">
                      Autonomous Routing & Bedrock Analysis
                    </h2>
                 </div>
                 <div className="text-left">
                    <p className="text-base md:text-lg text-white/60 font-light leading-relaxed mb-6 md:mb-8 max-w-2xl">
                      Traffic is continuously analyzed by AWS Bedrock for anomaly detection before being deterministically routed via our decentralized intent solver network.
                    </p>
                 </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start">
                 <div className="bg-bg-elevated/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl w-full h-full">
                    <AIAgentFlowVisualizer />
                 </div>
                 <div className="bg-bg-elevated/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl w-full h-full">
                    <AIFraudInsightPanel />
                 </div>
              </div>
           </div>
        </section>

        {/* ========================================================= */}
        {/* SEC 6: ECONOMICS & TELEMETRY */}
        {/* ========================================================= */}
        <section className="cinematic-section py-16 md:py-24 lg:py-32 relative">
           <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12 relative z-10">
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start mb-12 md:mb-16">
                 <div className="text-left">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 md:mb-8 text-white max-w-4xl">
                      Predictive Gas Oracle & Merchant Telemetry
                    </h2>
                 </div>
                 <div className="text-left">
                    <p className="text-base md:text-lg text-white/60 font-light leading-relaxed mb-6 md:mb-8 max-w-2xl">
                      Real-time monitoring of network conditions ensures optimal execution timing and deep visibility into transaction success rates.
                    </p>
                 </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start">
                 <div className="bg-bg-elevated/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl w-full h-full">
                    <GasPredictionVisualizer />
                 </div>
                 <div className="bg-bg-elevated/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl w-full h-full">
                    <RealTimeMerchantDashboard />
                 </div>
              </div>
           </div>
        </section>

        {/* ========================================================= */}
        {/* SEC 7: MINIMAL FOOTER */}
        {/* ========================================================= */}
        <footer className="py-16 md:py-24 lg:py-32 border-t border-white/[0.02] relative z-10 bg-bg-void text-center">
          <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12 flex flex-col items-center justify-center gap-8 md:gap-12">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-6 md:mb-8 bg-clip-text text-transparent bg-gradient-to-br from-white to-white/30 max-w-4xl">
               Build With Vessel.
            </h2>
            <div className="flex items-center gap-4 md:gap-6">
              <span className="text-sm flex items-center gap-2 text-white/40 uppercase tracking-widest font-mono">
                 <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" /> 
                 AWS Mainnet Operational
              </span>
            </div>
            <p className="text-xs text-white/30 font-mono tracking-wider mt-12 md:mt-16 mb-6 md:mb-8 max-w-2xl leading-relaxed">
              © 2026 Vessel Labs.
            </p>
          </div>
        </footer>

      </main>
    </SmoothScrollProvider>
  );
}
