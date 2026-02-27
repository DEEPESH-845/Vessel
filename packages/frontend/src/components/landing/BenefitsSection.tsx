'use client';

/**
 * BenefitsSection Component
 * Value proposition with GSAP ScrollTrigger animations - UNIFIED DESIGN SYSTEM
 */

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { BracketLabel } from './BracketLabel';
import { Container } from '../layout/Container';
import { Section } from '../layout/Section';

const merchantBenefits = [
  {
    title: 'Lower Costs',
    description: 'No gas costs passed to customers. AI optimization saves 0.3-0.5% per transaction.',
    stat: '0.5%',
    statLabel: 'Savings',
  },
  {
    title: 'Higher Conversion',
    description: 'Gasless checkout reduces abandonment by 30%. Card-like UX with crypto settlement.',
    stat: '30%',
    statLabel: 'Less Abandonment',
  },
  {
    title: 'Instant Settlement',
    description: 'Funds arrive in your preferred stablecoin within 15 seconds. No waiting, no uncertainty.',
    stat: '<15s',
    statLabel: 'Settlement',
  },
  {
    title: 'Fraud Protection',
    description: 'AI-powered fraud detection with 94% improvement over rule-based systems. Your revenue is protected.',
    stat: '94%',
    statLabel: 'Better Detection',
  },
];

const consumerBenefits = [
  {
    title: 'No Gas Required',
    description: 'Pay with any stablecoin without holding ETH. Paymaster covers all transaction costs.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'One-Tap Payment',
    description: 'Scan QR, Sign once. Done. No wallet setup, no seed phrases, no complexity.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
      </svg>
    ),
  },
  {
    title: 'Any Stablecoin',
    description: 'Pay with USDC, USDT, DAI, EURC, or any supported stablecoin. Auto-swapped to merchant preference.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    title: 'Cross-Border',
    description: 'Send payments globally. No FX spreads, no intermediaries, no 48-hour waits.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 2v2.945" />
      </svg>
    ),
  },
];

export function BenefitsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const merchantRef = useRef<HTMLDivElement>(null);
  const consumerRef = useRef<HTMLDivElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    const initGSAP = async () => {
      const ScrollTrigger = (await import('gsap/ScrollTrigger')).ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      if (!sectionRef.current) return;

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      // Heading animation
      if (headingRef.current) {
        gsap.fromTo(headingRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headingRef.current,
              start: 'top 85%',
            },
          }
        );
      }

      // Merchant benefits animation
      if (merchantRef.current) {
        const cards = merchantRef.current.querySelectorAll('.benefit-card');
        
        gsap.set(merchantRef.current, { opacity: 0, x: -40 });
        gsap.set(cards, { opacity: 0, y: 30 });
        
        gsap.to(merchantRef.current, {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: merchantRef.current,
            start: 'top 80%',
          },
        });
        
        gsap.to(cards, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: merchantRef.current,
            start: 'top 80%',
          },
        });
      }

      // Consumer benefits animation
      if (consumerRef.current) {
        const cards = consumerRef.current.querySelectorAll('.consumer-card');
        
        gsap.set(consumerRef.current, { opacity: 0, x: 40 });
        gsap.set(cards, { opacity: 0, y: 25 });
        
        gsap.to(consumerRef.current, {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: consumerRef.current,
            start: 'top 80%',
          },
        });
        
        gsap.to(cards, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: consumerRef.current,
            start: 'top 80%',
          },
        });
      }

      // Comparison table animation
      if (comparisonRef.current) {
        gsap.set(comparisonRef.current, { opacity: 0, y: 40 });
        
        gsap.to(comparisonRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: comparisonRef.current,
            start: 'top 85%',
          },
        });
      }
    };

    initGSAP();

    return () => {
      if (typeof window !== 'undefined') {
        import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
          ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        });
      }
    };
  }, [mounted]);

  return (
    <Section
      id="benefits"
      ref={sectionRef}
      className="relative section-bg-primary overflow-hidden"
    >
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.05) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      <Container className="relative z-10">
        {/* Section Label */}
        <div className="flex justify-center mb-8">
          <BracketLabel>Benefits</BracketLabel>
        </div>

        {/* Section Heading - Unified typography */}
        <div ref={headingRef} className="text-center mb-16 md:mb-24">
          <h2 className="heading-section mb-6">
            Built for{' '}
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              Everyone
            </span>
          </h2>
          <p className="text-white/60 max-w-[60ch] mx-auto text-lg leading-relaxed">
            Whether you're a merchant accepting payments or a consumer making them, Vessel works for you.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Merchant Benefits */}
          <div ref={merchantRef}>
            <div className="mb-10">
              <span className="text-sm text-blue-400 font-bold uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">For Merchants</span>
              <h3 className="text-3xl font-bold text-white mt-6 mb-4">Accept Crypto, Get Paid in Your Currency</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {merchantBenefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="benefit-card card-unified p-6 flex flex-col items-start"
                >
                  <div className="text-3xl font-bold text-blue-400 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {benefit.stat}
                  </div>
                  <div className="text-xs text-white/50 uppercase tracking-widest font-medium mb-4">
                    {benefit.statLabel}
                  </div>
                  <h4 className="text-base font-semibold text-white mb-2">
                    {benefit.title}
                  </h4>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Consumer Benefits */}
          <div ref={consumerRef}>
            <div className="mb-10">
              <span className="text-sm text-teal-400 font-bold uppercase tracking-widest bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">For Consumers</span>
              <h3 className="text-3xl font-bold text-white mt-6 mb-4">Pay Without the Complexity</h3>
            </div>

            <div className="space-y-6">
              {consumerBenefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="consumer-card flex items-start gap-6 p-6 rounded-2xl group card-unified"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-teal-500/10 text-teal-400 group-hover:bg-teal-500/20 transition-colors border border-teal-500/20">
                    {benefit.icon}
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-white mb-2 group-hover:text-teal-400 transition-colors">
                      {benefit.title}
                    </h4>
                    <p className="text-sm text-white/60 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Comparison */}
        <div
          ref={comparisonRef}
          className="mt-20 md:mt-32 p-8 md:p-12 rounded-3xl card-unified relative overflow-hidden"
        >
          {/* Subtle glow behind table */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/5 filter blur-[100px] rounded-full pointer-events-none" />

          <h4 className="text-center text-xl font-bold text-white mb-10 relative z-10">
            Vessel vs. Traditional Crypto Payments
          </h4>

          <div className="max-w-4xl mx-auto overflow-x-auto relative z-10">
            <div className="min-w-[600px]">
              <div className="grid grid-cols-3 gap-6 text-center border-b border-white/10 pb-6 mb-6">
                <div className="text-white/50 text-sm font-semibold uppercase tracking-widest">Metric</div>
                <div className="text-white/50 text-sm font-semibold uppercase tracking-widest">Traditional</div>
                <div className="text-blue-400 text-sm font-semibold uppercase tracking-widest">Vessel</div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-6 text-center items-center">
                  <div className="text-white/80 text-base font-medium">Checkout Abandonment</div>
                  <div className="text-white/40 text-base font-medium">67%</div>
                  <div className="text-teal-400 text-lg font-bold">37%</div>
                </div>

                <div className="grid grid-cols-3 gap-6 text-center items-center">
                  <div className="text-white/80 text-base font-medium">Settlement Failures</div>
                  <div className="text-white/40 text-base font-medium">8-12%</div>
                  <div className="text-teal-400 text-lg font-bold">{'<2%'}</div>
                </div>

                <div className="grid grid-cols-3 gap-6 text-center items-center">
                  <div className="text-white/80 text-base font-medium">Payment Latency</div>
                  <div className="text-white/40 text-base font-medium">2-5 min</div>
                  <div className="text-teal-400 text-lg font-bold">{'<15s'}</div>
                </div>

                <div className="grid grid-cols-3 gap-6 text-center items-center">
                  <div className="text-white/80 text-base font-medium">Fraud Rate</div>
                  <div className="text-white/40 text-base font-medium">3.2%</div>
                  <div className="text-teal-400 text-lg font-bold">0.2%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default BenefitsSection;