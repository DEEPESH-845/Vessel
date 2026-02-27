'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export function CyberHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure GSAP context for proper cleanup
    let ctx = gsap.context(() => {
      // 1. Initial Load Animation
      gsap.fromTo('.hero-text-line',
        { y: 150, opacity: 0, rotate: 5 },
        { y: 0, opacity: 1, rotate: 0, duration: 1.2, stagger: 0.1, ease: 'power4.out', delay: 0.2 }
      );

      // 2. ScrollTrigger Pinning and Reveal Logic
      // Pins the hero section while breaking apart the text to reveal the next section
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=150%', // Pin for 150% of viewport height
          pin: true,
          scrub: 1, // Smooth scrubbing
        }
      });

      // Text scales up massively and fades out, creating a "pass through" effect
      tl.to('.hero-text-line', {
        scale: 4,
        opacity: 0,
        z: 500,
        stagger: 0.1,
        ease: 'power2.inOut',
      }, 0);

      // Background grid zooms in
      tl.to('.bg-grid', {
        scale: 2,
        opacity: 0,
        ease: 'power1.inOut',
      }, 0);
    }, containerRef); // Scope to container

    return () => ctx.revert(); // Cleanup on unmount
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen w-full flex items-center justify-center overflow-hidden font-mono bg-black z-10">
      <div className="absolute inset-0 scanlines opacity-30 z-10 pointer-events-none" />

      {/* Background grid */}
      <div className="bg-grid absolute inset-0 z-0 origin-center"
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '4vw 4vw' }}
      />

      <div ref={textContainerRef} className="relative z-20 text-center flex flex-col gap-2 origin-center" style={{ perspective: '1000px' }}>
        <div className="overflow-visible">
          <h1 className="hero-text-line text-[10vw] font-black leading-none uppercase tracking-tighter text-white inline-block origin-center transform-gpu">
            VESSEL <span className="text-[#00ff41]">PROTOCOL</span>
          </h1>
        </div>
        <div className="overflow-visible">
          <h1 className="hero-text-line text-[10vw] font-black leading-none uppercase tracking-tighter text-transparent inline-block origin-center transform-gpu" style={{ WebkitTextStroke: '2px white' }}>
            ZERO_GAS
          </h1>
        </div>
      </div>
    </section>
  );
}
