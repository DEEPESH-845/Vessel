'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export function CyberGlobe() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Basic fade in when scrolled into view
      gsap.from('.globe-content', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-[120vh] w-full flex items-center justify-center bg-black border-t border-white/5 py-32 z-20">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none z-10" />

      <div className="globe-content container mx-auto px-6 relative z-20 flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 mb-12 md:mb-0">
          <h2 className="font-display text-4xl md:text-6xl font-black mb-6 uppercase tracking-tight">
            GLOBAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">INFRASTRUCTURE</span>
          </h2>
          <p className="font-mono text-gray-400 text-lg max-w-lg mb-8">
            The decentralized network connecting stablecoin liquidity across borders instantly.
            Powered by smart contracts on Lisk Sepolia.
          </p>
          <div className="flex gap-4">
            <div className="border border-[#00ff41]/30 bg-[#00ff41]/5 p-4 rounded-md flex-1">
              <div className="text-[#00ff41] font-mono text-sm mb-1">Latency</div>
              <div className="text-white font-mono text-2xl font-bold">~2s</div>
            </div>
            <div className="border border-white/10 bg-white/5 p-4 rounded-md flex-1">
              <div className="text-gray-400 font-mono text-sm mb-1">Availability</div>
              <div className="text-white font-mono text-2xl font-bold">99.9%</div>
            </div>
          </div>
        </div>

        <div className="md:w-1/2 aspect-square relative flex items-center justify-center border border-white/10 rounded-full bg-white/5 overflow-hidden">
          {/* Placeholder for actual Aceternity/Globe.gl component */}
          <div className="text-center">
            <div className="animate-spin-slow w-48 h-48 md:w-80 md:h-80 border-4 border-dashed border-[#00ff41]/20 rounded-full flex items-center justify-center relative">
              <div className="absolute inset-0 border-2 border-solid border-white/10 rounded-full scale-75"></div>
              <div className="absolute inset-0 border border-solid border-[#00ff41]/50 rounded-full scale-110 blur-sm"></div>
              <span className="font-mono text-[#00ff41] opacity-50 block rotate-0 animate-none">[GLOBE_COMPONENT_PLACEHOLDER]</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
