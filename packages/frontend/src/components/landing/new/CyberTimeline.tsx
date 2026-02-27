'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export function CyberTimeline() {
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const items = gsap.utils.toArray('.timeline-item');

      items.forEach((item: any, i) => {
        gsap.fromTo(item,
          { opacity: 0, x: -50 },
          {
            scrollTrigger: {
              trigger: item,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power2.out',
            delay: i * 0.1, // Stagger effect based on index
          }
        );
      });
    }, timelineRef);

    return () => ctx.revert();
  }, []);

  const steps = [
    { title: 'SCAN', description: 'User scans a recipient QR code.' },
    { title: 'AI ROUTING', description: 'Agent determines the lowest fee path.' },
    { title: 'SIGN', description: 'User signs the intention (Paymaster covers gas).' },
    { title: 'SETTLE', description: 'Smart contract executes stablecoin swap & transfer.' },
  ];

  return (
    <section ref={timelineRef} className="relative min-h-screen w-full bg-black py-32 z-20 border-t border-white/10">
      <div className="container mx-auto px-6 max-w-4xl">
        <h2 className="font-display text-4xl md:text-5xl font-black mb-16 text-center uppercase tracking-tighter">
          TRANSACTION <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-white">FLOW</span>
        </h2>

        <div className="relative border-l border-[#00ff41]/30 ml-4 md:ml-0 pl-8 md:pl-0 space-y-16">
          {steps.map((step, idx) => (
            <div key={idx} className="timeline-item relative md:flex md:items-center md:justify-between">
              {/* Dot on the line */}
              <div className="absolute -left-[41px] md:left-1/2 md:-ml-[7px] top-1 w-3 h-3 bg-[#00ff41] rounded-full shadow-[0_0_10px_#00ff41]" />

              {/* Content Box */}
              <div className={`md:w-5/12 ${idx % 2 === 0 ? 'md:text-right md:pr-12' : 'md:ml-auto md:pl-12'}`}>
                <div className="border border-white/10 bg-white/5 p-6 rounded-lg backdrop-blur-sm hover:border-[#00ff41]/50 transition-colors group">
                  <h3 className="font-mono text-[#00ff41] font-bold text-xl mb-2 flex items-center gap-2 md:justify-end">
                    <span className="text-xs text-gray-500">0{idx + 1}</span> {step.title}
                  </h3>
                  <p className="font-mono text-gray-400 text-sm">{step.description}</p>
                </div>
              </div>

              {/* Center line (only visible on desktop, mobile uses the left line) */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-[-4rem] w-px bg-gradient-to-b from-[#00ff41]/30 to-transparent -z-10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
