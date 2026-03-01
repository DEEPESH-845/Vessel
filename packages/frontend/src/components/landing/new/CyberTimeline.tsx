'use client';

import { useEffect, useRef } from 'react';
import { Scan, BrainCircuit, PenTool, ArrowRightLeft } from 'lucide-react';
import { gsap, ScrollTrigger } from '@/lib/animations/gsap-config';
import { cn } from '@/lib/utils';
import { animate } from 'animejs';

interface TimelineStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: TimelineStep[] = [
  {
    title: 'SCAN',
    description: 'User scans a recipient QR code with instant address validation.',
    icon: <Scan className="w-6 h-6 text-[#00ff41]" aria-hidden="true" />
  },
  {
    title: 'AI ROUTING',
    description: 'Autonomous agent determines the lowest fee path across L2s in milliseconds.',
    icon: <BrainCircuit className="w-6 h-6 text-[#00ff41]" aria-hidden="true" />
  },
  {
    title: 'SIGN INTENT',
    description: 'User signs the intention via Session Key. ERC-4337 Paymaster sponsors all gas.',
    icon: <PenTool className="w-6 h-6 text-[#00ff41]" aria-hidden="true" />
  },
  {
    title: 'SETTLE',
    description: 'Smart contracts execute exact-in/exact-out stablecoin swap & transfer atomically.',
    icon: <ArrowRightLeft className="w-6 h-6 text-[#00ff41]" aria-hidden="true" />
  },
];

export function CyberTimeline() {
  const containerRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set('.timeline-item, .timeline-dot, .tracing-beam, .timeline-card, .timeline-number', {
          opacity: 1,
          scale: 1,
          x: 0,
          scaleY: 1
        });
        return;
      }

      // 1. Tracing Beam Animation with AnimeJS mixed with GSAP ScrollTrigger
      if (trackRef.current && beamRef.current) {
        gsap.fromTo(
          beamRef.current,
          { scaleY: 0, transformOrigin: 'top center' },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: trackRef.current,
              start: 'top center',
              end: 'bottom center',
              scrub: 0.5,
            }
          }
        );
      }

      // 2. Timeline Items Animation using Anime.js triggered by GSAP
      const items = gsap.utils.toArray<HTMLElement>('.timeline-item');

      items.forEach((item, i) => {
        const isEven = i % 2 === 0;
        const desktopXOffset = isEven ? -60 : 60;

        const card = item.querySelector('.timeline-card') as HTMLElement;
        const dot = item.querySelector('.timeline-dot') as HTMLElement;
        const number = item.querySelector('.timeline-number') as HTMLElement;

        ScrollTrigger.create({
          trigger: item,
          start: 'top 85%',
          onEnter: () => {
            // Card Entrance
            if (card) {
              animate(card, {
                translateX: window.innerWidth >= 768 ? [desktopXOffset, 0] : [0, 0],
                translateY: window.innerWidth < 768 ? [40, 0] : [0, 0],
                opacity: [0, 1],
                scale: [0.95, 1],
                duration: 1200,
                ease: 'outQuint'
              });
            }

            // Dot Entrance
            if (dot) {
              animate(dot, {
                scale: [0, 1],
                opacity: [0, 1],
                duration: 800,
                delay: 200,
                ease: 'outElastic(1, .6)'
              });
            }

            // Giant Number Entrance
            if (number) {
              animate(number, {
                scale: [0.8, 1],
                opacity: [0, 0.03],
                translateY: [20, 0],
                duration: 1500,
                ease: 'outQuint'
              });
            }
          }
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-[#020202] pt-24 pb-48 md:pt-40 md:pb-64 lg:pt-56 lg:pb-80 z-20 font-sans overflow-hidden flex flex-col items-center justify-center min-h-[120vh]"
      aria-labelledby="timeline-heading"
    >
      {/* Background Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[1000px] max-h-[1000px] bg-[#00ff41] rounded-full blur-[150px] mix-blend-screen pointer-events-none z-0 opacity-[0.03] will-change-transform"
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl relative z-10 w-full mb-16 md:mb-24 lg:mb-32">

        {/* Header Section */}
        <header className="text-center mb-24 md:mb-40">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl mb-8 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#00ff41] opacity-90">
              Architecture
            </span>
          </div>
          <h2
            id="timeline-heading"
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black uppercase tracking-tighter text-white leading-[0.85]"
          >
            Transaction <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white/90 to-white/30" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.4)' }}>
              Flow
            </span>
          </h2>
        </header>

        {/* Timeline Layout */}
        <div className="relative pb-24 md:pb-32 lg:pb-40">

          {/* Timeline Track Container */}
          <div
            ref={trackRef}
            className="absolute left-[24px] md:left-1/2 md:-ml-[1.5px] top-0 bottom-0 w-[3px] rounded-full"
            aria-hidden="true"
          >
            {/* Background Track */}
            <div className="absolute inset-0 bg-white/[0.03]" />

            {/* Animated Tracing Beam */}
            <div
              ref={beamRef}
              className="tracing-beam absolute inset-0 bg-gradient-to-b from-transparent via-[#00ff41] to-[#00ff41] shadow-[0_0_20px_rgba(0,255,65,0.6)] will-change-transform"
            />
          </div>

          <div className="space-y-12 md:space-y-32">
            {steps.map((step, idx) => {
              const isEven = idx % 2 === 0;

              return (
                <article
                  key={idx}
                  className="timeline-item relative flex flex-col md:flex-row md:items-center"
                >
                  {/* Glowing Dot - Positioned absolutely relative to the row */}
                  <div
                    className="timeline-dot opacity-0 absolute left-[24px] -ml-[8px] md:left-1/2 md:-ml-[8px] top-10 md:top-1/2 md:-translate-y-1/2 w-4 h-4 bg-black border-[3px] border-[#00ff41] rounded-full shadow-[0_0_15px_rgba(0,255,65,0.6)] z-20 will-change-transform"
                    aria-hidden="true"
                  />

                  {/* Content Container - alternating sides on desktop */}
                  <div
                    className={cn(
                      "w-[calc(100%-3rem)] ml-[3rem] md:w-[calc(50%-30px)] flex flex-col justify-center",
                      isEven
                        ? "md:pr-16 lg:pr-24 md:text-right md:ml-0"
                        : "md:pl-16 lg:pl-24 md:ml-auto"
                    )}
                  >
                    {/* Glassmorphic Card */}
                    <div className="timeline-card opacity-0 group relative p-6 sm:p-8 lg:p-12 rounded-[2rem] bg-white/[0.015] border border-white/[0.05] backdrop-blur-2xl hover:bg-white/[0.03] hover:border-[#00ff41]/30 transition-all duration-700 ease-out overflow-hidden will-change-transform">

                      {/* Interactive Hover Glow Inside Card */}
                      <div
                        className="absolute inset-0 bg-gradient-to-br from-[#00ff41]/0 via-[#00ff41]/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"
                        aria-hidden="true"
                      />

                      {/* Header Row: Icon + Title */}
                      <div className={cn(
                        "flex flex-row items-center gap-5 md:gap-6 mb-5 md:mb-8",
                        isEven ? "md:flex-row-reverse md:text-right" : "text-left"
                      )}>
                        <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-[1.25rem] bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:bg-[#00ff41]/10 group-hover:border-[#00ff41]/30 group-hover:shadow-[0_0_30px_rgba(0,255,65,0.15)] transition-all duration-500 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#00ff41]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                          <div className="relative z-10">{step.icon}</div>
                        </div>
                        <h3 className={cn(
                          "font-bold text-white text-xl sm:text-2xl lg:text-3xl tracking-tight group-hover:text-[#00ff41] transition-colors duration-500",
                          isEven ? "md:text-right" : "text-left"
                        )}>
                          {step.title}
                        </h3>
                      </div>

                      {/* Description Text */}
                      <p className={cn(
                        "text-white/50 font-medium leading-[1.8] text-sm sm:text-base lg:text-lg tracking-wide group-hover:text-white/70 transition-colors duration-500",
                        isEven ? "md:text-right" : "text-left"
                      )}>
                        {step.description}
                      </p>

                      {/* Giant Step Number Watermark */}
                      <div
                        className={cn(
                          "timeline-number opacity-0 absolute -top-4 md:-top-10 text-[80px] md:text-[140px] lg:text-[180px] font-black text-white/[0.03] select-none pointer-events-none tracking-tighter leading-none z-[-1]",
                          isEven ? "right-4 md:translate-x-0 md:left-auto md:-right-8 lg:-right-16" : "right-4 md:translate-x-0 md:-left-8 lg:-left-16 md:right-auto"
                        )}
                        aria-hidden="true"
                      >
                        0{idx + 1}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}