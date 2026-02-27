'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export function CyberFeatures() {
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Animate grid items from bottom
      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 70%',
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
      });
    }, featuresRef);

    return () => ctx.revert();
  }, []);

  const featureList = [
    { title: 'AI ROUTING', icon: '🤖', description: 'Smart agent finds the cheapest swap paths.' },
    { title: 'GASLESS UX', icon: '⛽', description: 'ERC-4337 Paymaster covers transaction fees.' },
    { title: 'INSTANT SETTLE', icon: '⚡', description: 'Lisk Sepolia ensures sub-second finality.' },
    { title: 'CROSS-BORDER', icon: '🌍', description: 'Send stablecoins anywhere instantly.' },
    { title: 'NON-CUSTODIAL', icon: '🔐', description: 'You control your keys and your funds.' },
    { title: 'SCAN TO PAY', icon: '📱', description: 'One-tap QR payments for real-world utility.' },
  ];

  return (
    <section ref={featuresRef} className="relative min-h-[80vh] w-full bg-black py-32 z-20 border-t border-white/5">
      <div className="container mx-auto px-6 max-w-6xl">
        <h2 className="font-display text-3xl md:text-5xl font-black mb-16 text-center uppercase tracking-tighter">
          PROTOCOL <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff41] to-emerald-800">BENEFITS</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureList.map((item, idx) => (
            <div key={idx} className="feature-card group relative p-[1px] rounded-xl overflow-hidden bg-white/5 hover:bg-[#00ff41]/50 transition-colors duration-500">
              {/* Inner card content */}
              <div className="relative h-full bg-black rounded-xl p-8 flex flex-col items-start gap-4 z-10">
                <div className="text-4xl">{item.icon}</div>
                <h3 className="font-mono text-white text-lg font-bold tracking-wide group-hover:text-[#00ff41] transition-colors">{item.title}</h3>
                <p className="font-mono text-gray-500 text-sm">{item.description}</p>

                {/* Hover gradient effect placeholder */}
                <div className="absolute -inset-2 rounded-xl opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-500 bg-gradient-to-r from-[#00ff41] to-transparent blur-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
