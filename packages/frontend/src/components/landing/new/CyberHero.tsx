'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export function CyberHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP implementation for massive text scale-in
    if (!containerRef.current) return;

    gsap.fromTo('.hero-text-line',
      { y: 150, opacity: 0, rotate: 5 },
      { y: 0, opacity: 1, rotate: 0, duration: 1.2, stagger: 0.1, ease: 'power4.out', delay: 0.2 }
    );
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen w-full flex items-center justify-center overflow-hidden font-mono">
      <div className="absolute inset-0 scanlines opacity-30 z-10 pointer-events-none" />

      {/* Background grid */}
      <div className="absolute inset-0 z-0"
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '4vw 4vw' }}
      />

      <div className="relative z-20 text-center flex flex-col gap-2">
        <div className="overflow-hidden">
          <h1 className="hero-text-line text-[10vw] font-black leading-none uppercase tracking-tighter text-white">
            VESSEL <span className="text-[#00ff41]">PROTOCOL</span>
          </h1>
        </div>
        <div className="overflow-hidden">
          <h1 className="hero-text-line text-[10vw] font-black leading-none uppercase tracking-tighter text-transparent" style={{ WebkitTextStroke: '2px white' }}>
            ZERO_GAS
          </h1>
        </div>
      </div>
    </section>
  );
}