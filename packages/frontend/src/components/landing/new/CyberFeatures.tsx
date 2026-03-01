'use client';

import { useEffect, useRef } from 'react';
import { BrainCircuit, Fingerprint, Zap, Globe2, QrCode, Lock } from 'lucide-react';
import { gsap, ScrollTrigger } from '@/lib/animations/gsap-config';
import { animate, stagger } from 'animejs';

interface FeatureItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const features: FeatureItem[] = [
  {
    title: 'AI ROUTING',
    icon: <BrainCircuit className="w-8 h-8 text-[#00ff41] transition-transform duration-500 group-hover:scale-110" aria-hidden="true" />,
    description: 'Autonomous agent finds the lowest fee paths across liquidity pools and L2s.'
  },
  {
    title: 'GASLESS UX',
    icon: <Fingerprint className="w-8 h-8 text-white/70 group-hover:text-[#00ff41] transition-all duration-500 group-hover:scale-110" aria-hidden="true" />,
    description: 'ERC-4337 Paymaster completely abstracts transaction fees away from the user.'
  },
  {
    title: 'INSTANT SETTLE',
    icon: <Zap className="w-8 h-8 text-[#00ff41] transition-transform duration-500 group-hover:scale-110" aria-hidden="true" />,
    description: 'Lisk Sepolia ensures sub-second finality for lightning-fast commerce.'
  },
  {
    title: 'CROSS-BORDER',
    icon: <Globe2 className="w-8 h-8 text-white/70 group-hover:text-[#00ff41] transition-all duration-500 group-hover:scale-110" aria-hidden="true" />,
    description: 'Send and receive stablecoins globally without banks or intermediaries.'
  },
  {
    title: 'NON-CUSTODIAL',
    icon: <Lock className="w-8 h-8 text-[#00ff41] transition-transform duration-500 group-hover:scale-110" aria-hidden="true" />,
    description: 'You maintain absolute control over your private keys and your funds.'
  },
  {
    title: 'SCAN TO PAY',
    icon: <QrCode className="w-8 h-8 text-white/70 group-hover:text-[#00ff41] transition-all duration-500 group-hover:scale-110" aria-hidden="true" />,
    description: 'One-tap QR payments designed for real-world merchant utility.'
  },
];

export function CyberFeatures() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set('.features-header, .feature-card', { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' });
        return;
      }

      // 1. Header reveal
      if (headerRef.current) {
         ScrollTrigger.create({
             trigger: sectionRef.current,
             start: 'top 80%',
             onEnter: () => {
                 if (headerRef.current) {
                   animate(headerRef.current, {
                      translateY: [40, 0],
                      opacity: [0, 1],
                      filter: ['blur(15px)', 'blur(0px)'],
                      duration: 1200,
                      ease: 'outQuint'
                   });
                 }
             }
         });
      }

      // 2. Animate Grid Items with Anime.js staggered entrance
      if (gridRef.current) {
        const cards = gsap.utils.toArray('.feature-card') as HTMLElement[];

        ScrollTrigger.create({
            trigger: gridRef.current,
            start: 'top 85%',
            onEnter: () => {
                animate(cards, {
                    translateY: [60, 0],
                    opacity: [0, 1],
                    scale: [0.95, 1],
                    duration: 1000,
                    delay: stagger(100),
                    ease: 'outQuart'
                });
            }
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Hover interactions for cards via Anime.js
  const handleCardMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    const innerCard = card.querySelector('.inner-content') as HTMLElement | null;
    const glow = card.querySelector('.hover-glow') as HTMLElement | null;
    const borderLine = card.querySelector('.border-line') as HTMLElement | null;

    animate(card, {
        scale: 1.02,
        duration: 400,
        ease: 'outBack'
    });

    if (innerCard) {
      animate(innerCard, {
          backgroundColor: 'rgba(0, 255, 65, 0.03)',
          duration: 400,
          ease: 'outQuad'
      });
    }

    if (glow) {
      animate(glow, {
          opacity: 1,
          duration: 500,
          ease: 'outQuad'
      });
    }

    if (borderLine) {
      animate(borderLine, {
          opacity: 1,
          scaleX: [0, 1],
          duration: 600,
          ease: 'outQuart'
      });
    }
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
     const card = e.currentTarget;
     const innerCard = card.querySelector('.inner-content') as HTMLElement | null;
     const glow = card.querySelector('.hover-glow') as HTMLElement | null;
     const borderLine = card.querySelector('.border-line') as HTMLElement | null;

     animate(card, {
        scale: 1,
        duration: 500,
        ease: 'outElastic(1, .8)'
    });

    if (innerCard) {
      animate(innerCard, {
          backgroundColor: 'rgba(5, 5, 5, 1)',
          duration: 500,
          ease: 'outQuad'
      });
    }

    if (glow) {
      animate(glow, {
          opacity: 0,
          duration: 500,
          ease: 'outQuad'
      });
    }

    if (borderLine) {
       animate(borderLine, {
          opacity: 0,
          scaleX: 0,
          duration: 500,
          ease: 'outQuad'
      });
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#020202] pt-24 pb-32 md:pt-40 md:pb-48 lg:pt-48 lg:pb-64 z-20 overflow-hidden font-sans"
      aria-labelledby="features-heading"
    >
      {/* Background Radial Glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[1000px] bg-[#00ff41] rounded-full blur-[180px] pointer-events-none mix-blend-screen z-0 opacity-[0.04]"
        aria-hidden="true"
      />

      {/* Grid Pattern Background - Improved subtle grid texture */}
      <div
        className="absolute inset-0 z-0 opacity-[0.3] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
        }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px] relative z-10">

        {/* Section Header */}
        <header ref={headerRef} className="features-header text-center mb-20 md:mb-32 opacity-0">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl mb-8 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#00ff41]">
              Capabilities
            </span>
          </div>
          <h2
            id="features-heading"
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black uppercase tracking-tighter text-white leading-none max-w-4xl mx-auto"
          >
            Protocol <br className="md:hidden"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white/90 to-white/30" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.4)' }}>
              Benefits
            </span>
          </h2>
        </header>

        {/* Benefits Grid */}
        <div
          ref={gridRef}
          className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10"
        >
          {features.map((item, idx) => (
            <article
              key={idx}
              className="feature-card group relative p-[1px] rounded-[2rem] overflow-hidden bg-white/5 opacity-0 will-change-transform transform-gpu"
              onMouseEnter={handleCardMouseEnter}
              onMouseLeave={handleCardMouseLeave}
              style={{ perspective: '1000px' }}
            >
              {/* Inner Card Content (Glassmorphism & Dark Surface) */}
              <div className="inner-content relative h-full bg-[#050505] backdrop-blur-2xl rounded-[31px] p-8 lg:p-12 flex flex-col items-start gap-8 z-10 transition-colors duration-500">

                {/* Icon Container */}
                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center transition-all duration-500 overflow-hidden shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
                  {item.icon}

                  {/* Subtle hover flare behind the icon */}
                  <div
                    className="hover-glow absolute inset-0 bg-[#00ff41] rounded-2xl blur-xl opacity-0 pointer-events-none mix-blend-screen"
                    style={{ opacity: 0 }}
                    aria-hidden="true"
                  />
                </div>

                {/* Text Content */}
                <div className="space-y-4 flex-grow">
                  <h3 className="font-bold text-white text-xl md:text-2xl lg:text-3xl tracking-tight transition-colors duration-500">
                    {item.title}
                  </h3>
                  <p className="text-white/50 font-medium leading-[1.8] text-sm md:text-base lg:text-lg tracking-wide transition-colors duration-500">
                    {item.description}
                  </p>
                </div>

                {/* Decorative glowing bottom border line on hover */}
                <div
                  className="border-line absolute bottom-0 left-10 right-10 h-1 bg-gradient-to-r from-transparent via-[#00ff41] to-transparent opacity-0 origin-center blur-[2px]"
                  style={{ opacity: 0, transform: 'scaleX(0)' }}
                  aria-hidden="true"
                />
                 <div
                  className="border-line absolute bottom-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-[#00ff41] to-transparent opacity-0 origin-center"
                  style={{ opacity: 0, transform: 'scaleX(0)' }}
                  aria-hidden="true"
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}