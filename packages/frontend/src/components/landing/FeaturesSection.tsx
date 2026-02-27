'use client';

/**
 * FeaturesSection Component
 * Key features with GSAP ScrollTrigger reveals - UNIFIED DESIGN SYSTEM
 */

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { BracketLabel } from './BracketLabel';
import { Container } from '../layout/Container';
import { Section } from '../layout/Section';

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Gasless Transactions',
    description: 'ERC-4337 Paymaster sponsors all gas fees. Users never need to hold ETH or native tokens to pay.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    title: 'Auto-Swap',
    description: 'StableSwap AMM automatically converts any stablecoin to the merchant\'s preferred settlement currency.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Enterprise Security',
    description: 'AWS KMS key management, backend-signed authorizations, and real-time fraud detection.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'AI Optimization',
    description: 'Amazon Bedrock agents route transactions optimally. SageMaker models predict gas spikes.',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 2v2.945" />
      </svg>
    ),
    title: 'Cross-Border',
    description: 'Send payments globally in seconds. No intermediaries, no FX spreads, no waiting.',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: 'One-Tap UX',
    description: 'Social login + QR scan + single signature. No wallet setup, no seed phrases, no complexity.',
    gradient: 'from-pink-500 to-rose-500',
  },
];

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
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

      // Check for reduced motion
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
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Cards staggered animation
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll('.feature-card');
        
        gsap.set(cards, { opacity: 0, y: 50 });
        
        gsap.to(cards, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
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
      id="features"
      ref={sectionRef}
      className="relative section-bg-primary overflow-hidden"
    >
      {/* Background Gradient - Subtle continuation from hero */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)',
        }}
      />

      <Container className="relative z-10">
        {/* Section Label */}
        <div className="flex justify-center mb-8">
          <BracketLabel>Features</BracketLabel>
        </div>

        {/* Section Heading - Unified typography */}
        <div ref={headingRef} className="text-center mb-16 md:mb-24">
          <h2 className="heading-section mb-6">
            Everything You Need for{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Gasless Payments
            </span>
          </h2>
          <p className="text-white/60 max-w-[60ch] mx-auto text-lg leading-relaxed">
            Built on Lisk with ERC-4337 Account Abstraction, StableSwap AMM, and AWS AI services.
          </p>
        </div>

        {/* Features Grid - Unified grid system */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="feature-card group card-unified relative overflow-hidden flex flex-col items-start"
            >
              {/* Icon */}
              <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.gradient} bg-opacity-10 mb-6`}>
                <div className="text-white">{feature.icon}</div>
              </div>

              {/* Content */}
              <h3 className="heading-card mb-3 group-hover:text-blue-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-base text-white/60 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover glow effect */}
              <div
                className="absolute inset-0 rounded-[var(--radius-2xl)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
                }}
              />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export default FeaturesSection;