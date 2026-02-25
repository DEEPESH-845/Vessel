"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap"; 
import { ShieldAlert, Cpu, ArrowRight } from "lucide-react";
import { useTiltEffect } from "@/hooks/useTiltEffect";

export function ProblemSolution() {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Attach cinematic 3D tilt tracking to the solution card
  const solutionCardRef = useTiltEffect<HTMLDivElement>({ tiltIntensity: 12, scale: 1.02 });

  useEffect(() => {
    if (typeof window === "undefined" || !sectionRef.current) return;
    
    // Lazy load ScrollTrigger to prevent SSR issues
    const initScrollTrigger = async () => {
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      
      const ctx = gsap.context(() => {
        // Timeline for friction reveal
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            end: "bottom 30%",
          }
        });

        tl.from(".problem-card", {
          opacity: 0,
          y: 60,
          rotationX: -15,
          duration: 1,
          ease: "back.out(1.2)"
        })
        .from(".solution-card", {
          opacity: 0,
          y: 40,
          rotationX: 15,
          duration: 1,
          ease: "power3.out"
        }, "-=0.6")
        .from(".connector-arrow", {
          opacity: 0,
          scale: 0.5,
          duration: 0.5,
          ease: "elastic.out(1, 0.5)"
        }, "-=0.8");
      }, sectionRef);

      return () => ctx.revert();
    };
    
    initScrollTrigger();
  }, []);

  return (
    <div 
      ref={sectionRef} 
      className="relative z-10 w-full flex justify-center perspective-[1200px]"
    >
      <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start mb-12 md:mb-16">
          <div className="text-left">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 md:mb-8 text-white max-w-4xl">
              Abstracting <span className="text-white/40">the Friction</span>
            </h2>
          </div>
          <div className="text-left">
            <p className="text-base md:text-lg text-white/60 font-light leading-relaxed mb-6 md:mb-8 max-w-2xl">
              We've eliminated the legacy hurdles of crypto infrastructure, providing a frictionless, enterprise-grade experience.
            </p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start relative">
          
          {/* Problem Card */}
          <div className="problem-card card-cinematic p-8 md:p-10 relative grayscale-[80%] border-white/5 opacity-80 backdrop-blur-md w-full h-full flex flex-col justify-center">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
            <ShieldAlert className="w-8 h-8 text-red-400 mb-6 drop-shadow-lg" />
            <h3 className="text-xl md:text-2xl font-semibold mb-6 tracking-tight text-white/90 max-w-xl">Legacy UX is Broken</h3>
            <ul className="space-y-4 text-sm md:text-base font-mono text-white/50 tracking-wide max-w-xl">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-red-400/50 mt-2" />
                <span>Seed phrase friction drops conversion 85%</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-red-400/50 mt-2" />
                <span>Gas tokens confuse mainstream users</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-red-400/50 mt-2" />
                <span>Opaque tx states cause support tickets</span>
              </li>
            </ul>
          </div>

          <div className="hidden md:flex connector-arrow absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-void/80 backdrop-blur-xl">
             <ArrowRight className="w-5 h-5 text-white/30" />
          </div>

          {/* Solution Card with Tilt tracking */}
          <div 
            ref={solutionCardRef}
            className="solution-card card-cinematic p-8 md:p-10 relative border-primary/20 shadow-[0_0_40px_rgba(59,130,246,0.1)] backdrop-blur-xl group hover:border-primary/40 transition-colors duration-500 will-change-transform w-full h-full flex flex-col justify-center"
          >
             <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
             <div className="absolute -inset-10 bg-primary/5 blur-3xl rounded-full group-hover:bg-primary/10 transition-colors duration-700 pointer-events-none" />
             
             <Cpu className="w-8 h-8 text-primary mb-6 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-transform group-hover:scale-110 duration-500" />
             <h3 className="text-xl md:text-2xl font-semibold mb-6 tracking-tight text-white drop-shadow-md max-w-xl">Enterprise Infrastructure</h3>
             <ul className="space-y-4 text-sm md:text-base font-mono text-white/70 tracking-wide max-w-xl">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 shrink-0 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)] mt-1.5" />
                <span>ERC-4337 Sponsored Gas limits</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 shrink-0 rounded-full bg-accent-cyan shadow-[0_0_8px_var(--color-accent-cyan)] mt-1.5" />
                <span>AWS Bedrock automated routing</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 shrink-0 rounded-full bg-neon-green shadow-[0_0_8px_var(--color-neon-green)] mt-1.5" />
                <span>Auth secured by AWS KMS Enclaves</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
