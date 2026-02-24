"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap"; 
import { ShieldAlert, Cpu, ArrowDown } from "lucide-react";

export function ProblemSolution() {
  const sectionRef = useRef<HTMLElement>(null);
  
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
    <section 
      ref={sectionRef} 
      className="py-32 relative z-10 w-full flex justify-center perspective-[1200px]"
    >
      <div className="container-section max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center tracking-tight">
          Abstracting <span className="text-white/40">the Friction</span>
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
          
          {/* Problem Card */}
          <div className="problem-card card-cinematic p-8 relative grayscale-[80%] border-white/5 opacity-80 backdrop-blur-md">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
            <ShieldAlert className="w-8 h-8 text-red-400 mb-6 drop-shadow-lg" />
            <h3 className="text-xl font-bold mb-4 tracking-tight">Legacy UX is Broken</h3>
            <ul className="space-y-4 text-sm font-mono text-white/50 tracking-wide">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400/50" />
                Seed phrase friction drops conversion 85%
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400/50" />
                Gas tokens confuse mainstream users
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400/50" />
                Opaque tx states cause support tickets
              </li>
            </ul>
          </div>

          <div className="hidden md:flex connector-arrow absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-void/80 backdrop-blur-xl">
             <ArrowDown className="w-5 h-5 text-white/30 -rotate-90" />
          </div>

          {/* Solution Card */}
          <div className="solution-card card-cinematic p-8 relative border-primary/20 shadow-[0_0_40px_rgba(59,130,246,0.1)] backdrop-blur-xl group hover:border-primary/40 transition-colors duration-500">
             <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
             <div className="absolute -inset-10 bg-primary/5 blur-3xl rounded-full group-hover:bg-primary/10 transition-colors duration-700 pointer-events-none" />
             
             <Cpu className="w-8 h-8 text-primary mb-6 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
             <h3 className="text-xl font-bold mb-4 tracking-tight text-white drop-shadow-md">Enterprise Infrastructure</h3>
             <ul className="space-y-4 text-sm font-mono text-white/70 tracking-wide">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                ERC-4337 Sponsored Gas limits
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                AWS Bedrock automated routing
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-green" />
                Auth secured by AWS KMS Enclaves
              </li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
