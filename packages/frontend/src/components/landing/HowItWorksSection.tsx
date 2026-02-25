'use client';

/**
 * HowItWorksSection Component
 * Step-by-step payment flow with GSAP ScrollTrigger animations - UNIFIED DESIGN SYSTEM
 */

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { BracketLabel } from './BracketLabel';

const steps = [
  {
    number: '01',
    title: 'Scan & Connect',
    description: 'Consumer scans merchant QR code and authenticates via social login. No wallet setup required.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h2m6-8h2m4 4h2M6 20h2m4-16h2m4 4h.01M6 20h.01" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'AI Optimization',
    description: 'Bedrock agents select optimal liquidity pools. SageMaker predicts gas prices and detects fraud.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Single Signature',
    description: 'User signs once with their smart wallet. No gas needed—Paymaster sponsors everything.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Atomic Settlement',
    description: 'Gelato Relay bundles gas sponsorship + swap + transfer. All-or-nothing execution in <15 seconds.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
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

      // Steps staggered animation
      if (stepsRef.current) {
        const stepCards = stepsRef.current.querySelectorAll('.step-card');
        
        gsap.set(stepCards, { opacity: 0, y: 60 });
        
        gsap.to(stepCards, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: stepsRef.current,
            start: 'top 80%',
          },
        });
      }

      // Stats animation
      if (statsRef.current) {
        const statCards = statsRef.current.querySelectorAll('.stat-card');
        
        gsap.set(statCards, { opacity: 0, y: 30, scale: 0.95 });
        
        gsap.to(statCards, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: statsRef.current,
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
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative section-vertical section-bg-dark overflow-hidden"
    >
      {/* Subtle Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 container-section">
        {/* Section Label */}
        <div className="flex justify-center mb-[var(--space-6)]">
          <BracketLabel>How It Works</BracketLabel>
        </div>

        {/* Section Heading - Unified typography */}
        <div ref={headingRef} className="text-center mb-[var(--space-12)]">
          <h2 className="heading-section mb-4">
            One Click.{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Zero Complexity.
            </span>
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto text-lg">
            From scan to settlement in under 15 seconds. Here's how Vessel makes crypto payments as easy as card payments.
          </p>
        </div>

        {/* Steps Grid - Unified grid system */}
        <div ref={stepsRef} className="relative">
          {/* Connection Line - Desktop only */}
          <div 
            className="absolute top-1/2 left-0 right-0 h-px hidden lg:block"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent)',
              transform: 'translateY(-50%)',
            }}
          />

          <div className="grid-cards-4">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="step-card relative"
              >
                {/* Card */}
                <div className="card-unified text-center">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30">
                    <span className="text-xs font-mono text-blue-400">{step.number}</span>
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/5">
                    <div className="text-blue-400">{step.icon}</div>
                  </div>

                  {/* Content */}
                  <h3 className="heading-card mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform translate-x-1/2 -translate-y-1/2 z-10">
                    <svg className="w-6 h-6 text-blue-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Stats - Unified grid */}
        <div ref={statsRef} className="mt-[var(--space-12)] grid-cards-4">
          {[
            { value: '<15s', label: 'Settlement Time' },
            { value: '0%', label: 'Gas for Users' },
            { value: '98%+', label: 'Success Rate' },
            { value: '$0.01', label: 'Min Transaction' },
          ].map((stat) => (
            <div 
              key={stat.label}
              className="stat-card text-center p-4 rounded-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <div className="text-2xl md:text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {stat.value}
              </div>
              <div className="text-xs text-white/40 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;