"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/landing/Navbar";
import { HeroMesh } from "@/components/fintech/HeroMesh";
import { ProblemSolution } from "@/components/fintech/ProblemSolution";
import { gsap } from "@/lib/gsap";

// High-Fidelity Components
import { AIFraudInsightPanel } from "@/components/aws-demo/AIFraudInsightPanel";
import { GasPredictionVisualizer } from "@/components/aws-demo/GasPredictionVisualizer";
import { SecurityTransparencyDrawer } from "@/components/aws-demo/SecurityTransparencyDrawer";
import { AIAgentFlowVisualizer } from "@/components/aws-demo/AIAgentFlowVisualizer";
import { RealTimeMerchantDashboard } from "@/components/aws-demo/RealTimeMerchantDashboard";
import { InteractivePaymentSimulation } from "@/components/aws-demo/InteractivePaymentSimulation";
import { DemoToggle } from "@/components/aws-demo/DemoToggle";
import { Sparkles, TerminalSquare, ShieldCheck } from "lucide-react";

// Dynamically import smooth scroll
const SmoothScrollProvider = dynamic(
  () => import("@/components/smooth-scroll-provider").then((mod) => mod.SmoothScrollProvider),
  { ssr: false }
);

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initGSAP = async () => {
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        // Hero Entrance
        gsap.from(".hero-anim", {
          y: 40,
          opacity: 0,
          stagger: 0.15,
          duration: 1.2,
          ease: "expo.out",
          delay: 0.2,
        });

        // Grid Entrance
        gsap.from(".fintech-grid-item", {
          scrollTrigger: {
            trigger: "#infrastructure-grid",
            start: "top 75%",
          },
          y: 40,
          opacity: 0,
          stagger: 0.1,
          duration: 1,
          ease: "power3.out",
        });
      }, containerRef);

      return () => ctx.revert();
    };

    initGSAP();
  }, []);

  return (
    <SmoothScrollProvider>
      <main ref={containerRef} className="relative min-h-screen bg-bg-void text-white font-sans selection:bg-primary/30">
        
        {/* Global Demo Toggle from AWS Store */}
        <DemoToggle />

        <Navbar />

        {/* ========================================================= */}
        {/* SECTION 1: HERO (AUTHORITY) */}
        {/* ========================================================= */}
        {/*
          SPACING FIX:
          - Use `py-24 md:py-32` for consistent vertical rhythm.
          - Use `px-6 md:px-8` for consistent container padding.
        */}
        <section className="relative min-h-screen flex flex-col items-center justify-center py-24 md:py-32 px-6 md:px-8 overflow-hidden">
          <HeroMesh />
          
          <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center text-center">
            
            <div className="hero-anim inline-flex items-center gap-2 px-4 py-2 mb-8 md:mb-12 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-mono text-white/60 tracking-widest uppercase">
              <Sparkles className="w-4 h-4 text-accent-cyan" />
              <span>Production-Ready AWS Web3 Infrastructure</span>
            </div>

            <h1 className="hero-anim text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1] md:leading-[1.05] mb-6 md:mb-8">
              Gasless Payments.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/40">
                Infinite Scale.
              </span>
            </h1>

            <p className="hero-anim text-lg md:text-xl text-white/50 max-w-3xl font-light mb-10 md:mb-16 leading-relaxed px-4">
              Vessel abstracts the friction of crypto via <span className="text-white/80 font-medium">ERC-4337</span> and <span className="text-white/80 font-medium">AWS Bedrock</span>. Zero gas limits. Instant settlement. Enterprise security.
            </p>

            <div className="hero-anim flex flex-col sm:flex-row items-center gap-4 md:gap-6 w-full justify-center">
              <button 
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-bg-void rounded-full font-bold text-sm tracking-widest uppercase transition-transform hover:scale-[1.02]"
                onClick={() => {
                   document.getElementById('infrastructure-grid')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <TerminalSquare className="w-5 h-5 fill-bg-void" />
                View Architecture
                <div className="absolute inset-0 rounded-full ring-2 ring-white/20 ring-offset-2 ring-offset-bg-void opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              
              <a 
                href="https://github.com/DEEPESH-845/Vessel"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-bold text-sm tracking-widest uppercase text-white transition-colors"
              >
                Review Source Code
              </a>
            </div>

          </div>

          {/* Bottom Hero Fade - Increased height for smoother transition */}
          <div className="absolute bottom-0 left-0 right-0 h-48 md:h-64 bg-gradient-to-t from-bg-void to-transparent z-10 pointer-events-none" />
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: PROBLEM -> SOLUTION */}
        {/* ========================================================= */}
        <ProblemSolution />

        {/* ========================================================= */}
        {/* SECTION 3: THE FINTECH INFRASTRUCTURE GRID */}
        {/* ========================================================= */}
        {/*
          SPACING FIX:
          - Use `py-24 md:py-32` for standard section vertical rhythm.
          - Use `px-6 md:px-8` for container edge spacing.
        */}
        <section id="infrastructure-grid" className="py-24 md:py-32 px-6 md:px-8 relative z-10 border-t border-white/5 bg-bg-surface/50">
          <div className="w-full max-w-7xl mx-auto">
            
            {/* 
              SPACING FIX:
              - Header bottom margin standardized to `mb-12 md:mb-16`.
            */}
            <div className="mb-12 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
               <div className="max-w-2xl">
                 <ShieldCheck className="w-10 h-10 text-neon-green mb-6" />
                 <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-4 text-white leading-tight">
                   The Vessel Hyper-Structure
                 </h2>
                 <p className="text-white/50 text-base md:text-lg leading-relaxed">
                   A fully autonomous cloud pipeline leveraging predictive ML for gas optimization and zero-trust perimeter defense.
                 </p>
               </div>
               <div className="flex items-center gap-4 shrink-0">
                 <div className="flex -space-x-3">
                   {['bg-primary', 'bg-accent-cyan', 'bg-neon-green'].map((color, i) => (
                      <div key={i} className={`w-10 h-10 rounded-full border-2 border-bg-void ${color} flex items-center justify-center opacity-80`} />
                   ))}
                 </div>
                 <span className="text-sm font-mono text-white/40 uppercase tracking-widest hidden sm:inline-block">Powered by AWS</span>
               </div>
            </div>

            {/* BENTO GRID LAYOUT */}
            {/*
              SPACING FIX:
              - Standardize gap to `gap-4 md:gap-6`
            */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 auto-rows-[minmax(320px,auto)]">
              
              {/* Top Row: AI Routing & Gas Prediction */}
              <div className="fintech-grid-item md:col-span-12 lg:col-span-7 bg-bg-elevated/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl flex flex-col">
                <AIAgentFlowVisualizer />
              </div>

              <div className="fintech-grid-item md:col-span-12 lg:col-span-5 bg-bg-elevated/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl flex flex-col">
                <GasPredictionVisualizer />
              </div>

              {/* Middle Row: Simulator & Security */}
              <div className="fintech-grid-item md:col-span-12 lg:col-span-6 lg:row-span-2 bg-gradient-to-br from-bg-elevated/80 to-bg-void border border-white/10 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl relative flex flex-col min-h-[400px]">
                 <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                 <InteractivePaymentSimulation />
                 {/* Instructions */}
                 <div className="absolute bottom-8 inset-x-6 text-center mt-auto">
                    <p className="text-[11px] font-mono text-white/40 uppercase tracking-widest">
                       Click to execute the deterministic cloud pipeline sequence.
                    </p>
                 </div>
              </div>

              {/* Middle Right: Fraud & Merchant */}
              <div className="fintech-grid-item md:col-span-12 lg:col-span-6 bg-bg-elevated/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl flex flex-col">
                 <AIFraudInsightPanel />
              </div>

              <div className="fintech-grid-item md:col-span-12 lg:col-span-6 bg-bg-elevated/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl flex flex-col">
                 <RealTimeMerchantDashboard />
              </div>
              
              {/* Bottom Row: Security Drawer spans full width below grid */}
              <div className="fintech-grid-item md:col-span-12 bg-bg-elevated/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl flex flex-col">
                 <SecurityTransparencyDrawer />
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 4: FOOTER (Clean Unified Style) */}
        {/* ========================================================= */}
        {/*
          SPACING FIX:
          - Standardize footer vertical rhythm to `py-12 md:py-16`
        */}
        <footer className="py-12 md:py-16 px-6 md:px-8 border-t border-white/[0.05] relative z-10 bg-bg-void text-center">
          <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm text-white/40 font-mono tracking-wide">
              © 2026 Vessel. Built for AWS Builder Center.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-sm flex items-center gap-2 text-white/40"><span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" /> Operational</span>
            </div>
          </div>
        </footer>

      </main>
    </SmoothScrollProvider>
  );
}