"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AIFraudInsightPanel } from "@/components/aws-demo/AIFraudInsightPanel";
import { GasPredictionVisualizer } from "@/components/aws-demo/GasPredictionVisualizer";
import { SecurityTransparencyDrawer } from "@/components/aws-demo/SecurityTransparencyDrawer";
import { AIAgentFlowVisualizer } from "@/components/aws-demo/AIAgentFlowVisualizer";
import { RealTimeMerchantDashboard } from "@/components/aws-demo/RealTimeMerchantDashboard";
import { InteractivePaymentSimulation } from "@/components/aws-demo/InteractivePaymentSimulation";
import { DemoToggle } from "@/components/aws-demo/DemoToggle";
import { ChevronDown, Code2, ShieldAlert, Cpu } from "lucide-react";

export default function AWSDemoPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    // Master timeline
    const ctx = gsap.context(() => {
      // 1. Hero Reveal
      gsap.from(".hero-element", {
        y: 60,
        opacity: 0,
        stagger: 0.15,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.2
      });

      // 2. Friction Section
      gsap.from(".friction-card", {
        scrollTrigger: {
          trigger: "#friction-section",
          start: "top 75%",
        },
        y: 40,
        opacity: 0,
        stagger: 0.2,
        duration: 0.8,
        ease: "back.out(1.2)"
      });

      // 3. Tech Breakthrough
      gsap.from(".tech-node", {
        scrollTrigger: {
          trigger: "#tech-breakthrough",
          start: "top 60%",
        },
        scale: 0.8,
        opacity: 0,
        stagger: 0.1,
        duration: 1,
        ease: "power2.out"
      });

      // 4. Live Dashboard Reveal
      gsap.from(".dashboard-panel", {
        scrollTrigger: {
          trigger: "#live-dashboard",
          start: "top 70%",
        },
        y: 50,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerRef} className="bg-void min-h-screen text-white font-sans selection:bg-primary/30">
      <DemoToggle />

      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-[40%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-accent-cyan/10 blur-[100px]" />
      </div>

      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className="relative z-10">
        {/* ========================================================= */}
        {/* SECTION 1: AUTHORITY (HERO) */}
        {/* ========================================================= */}
        <section className="min-h-screen flex flex-col items-center justify-center relative px-6 text-center">
          <div className="hero-element px-3 py-1 mb-8 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-mono text-white/60 tracking-widest uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon-green" />
            Vessel AWS Infra Demo
          </div>
          
          <h1 className="hero-element text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-6">
            Intelligent.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Zero Gas.</span>
          </h1>
          
          <p className="hero-element text-lg md:text-xl text-white/50 max-w-2xl font-light mb-12">
            The infrastructure layer for global stablecoin commerce. Powered by AWS Bedrock AI and deterministic Lisk rollups.
          </p>
          
          <div className="hero-element absolute bottom-12 animate-bounce">
            <ChevronDown className="w-6 h-6 text-white/30" />
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: FRICTION (PROBLEM) */}
        {/* ========================================================= */}
        <section id="friction-section" className="py-32 px-6 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">The Friction Problem</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="friction-card card-cinematic p-8 relative grayscale opacity-70">
              <ShieldAlert className="w-8 h-8 text-red-400 mb-6" />
              <h3 className="text-xl font-bold mb-3">Legacy UX</h3>
              <p className="text-white/50 leading-relaxed font-mono text-sm">
                Seed phrases, gas tokens, and opaque transaction states have destroyed conversion rates for 10+ years.
              </p>
            </div>
            <div className="friction-card card-cinematic p-8 relative border-primary/30 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
              <Cpu className="w-8 h-8 text-primary mb-6" />
              <h3 className="text-xl font-bold mb-3 text-primary">The Vessel Architecture</h3>
              <p className="text-white/70 leading-relaxed font-mono text-sm">
                Account abstraction (ERC-4337) combined with an AWS-powered AI agent network abstracts all complexity to the hyper-structure.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: TECH BREAKTHROUGH */}
        {/* ========================================================= */}
        <section id="tech-breakthrough" className="py-32 px-6 bg-white/[0.02] border-y border-white/[0.05]">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16 text-center">
              <Code2 className="w-8 h-8 text-accent-cyan mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Deep Infra Transparency</h2>
              <p className="text-white/50 max-w-xl mx-auto">
                Our infrastructure actively routes around network congestion, predicts gas vectors, and prevents fraud in sub-second intervals.
              </p>
            </div>
            
            <div className="tech-node mb-16">
              <AIAgentFlowVisualizer />
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 4: LIVE SYSTEM PROOF (DASHBOARD) */}
        {/* ========================================================= */}
        <section id="live-dashboard" className="py-32 px-6 max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-4">Live System Verification</h2>
            <p className="text-white/50">Run the deterministic test simulation to verify subsystem executions.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (Interactive Control) */}
            <div className="lg:col-span-3 dashboard-panel">
              <InteractivePaymentSimulation />
            </div>
            
            {/* Middle Grid (Insight panels) */}
            <div className="dashboard-panel">
              <AIFraudInsightPanel />
            </div>
            
            <div className="dashboard-panel">
              <GasPredictionVisualizer />
            </div>

            <div className="dashboard-panel">
              <RealTimeMerchantDashboard />
            </div>

            <div className="lg:col-span-3 dashboard-panel">
              <SecurityTransparencyDrawer />
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 5: CTA */}
        {/* ========================================================= */}
        <section className="py-32 text-center px-6">
          <h2 className="text-4xl font-bold mb-6">Designed for Enterprise Scale.</h2>
          <a href="https://github.com/DEEPESH-845/Vessel" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 transition-colors rounded-full font-mono text-sm tracking-widest uppercase">
            Review the source
          </a>
        </section>
      </div>
    </main>
  );
}
