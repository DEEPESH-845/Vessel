'use client';

/**
 * CTASection Component
 * Final call-to-action with GSAP ScrollTrigger animations - UNIFIED DESIGN SYSTEM
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from '@/lib/gsap';
import { BracketLabel } from './BracketLabel';
import { Container } from '../layout/Container';
import { Section } from '../layout/Section';

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    const initGSAP = async () => {
      const ScrollTrigger = (await import('gsap/ScrollTrigger')).ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      if (!sectionRef.current || !contentRef.current) return;

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      // Set initial states
      gsap.set(contentRef.current, { opacity: 0 });
      if (headingRef.current) gsap.set(headingRef.current, { opacity: 0, y: 50 });
      if (descriptionRef.current) gsap.set(descriptionRef.current, { opacity: 0, y: 30 });
      if (buttonsRef.current) gsap.set(buttonsRef.current, { opacity: 0, y: 30, scale: 0.95 });
      if (badgesRef.current) gsap.set(badgesRef.current, { opacity: 0, y: 20 });

      // Create timeline for orchestrated entrance
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
      });

      tl.to(contentRef.current, {
        opacity: 1,
        duration: 0.4,
      })
      .to(headingRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.2')
      .to(descriptionRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
      }, '-=0.5')
      .to(buttonsRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: 'back.out(1.4)',
      }, '-=0.4')
      .to(badgesRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
      }, '-=0.3');
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
      ref={sectionRef}
      className="relative section-bg-dark overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Main gradient */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px]"
          style={{
            background: 'radial-gradient(ellipse, rgba(59, 130, 246, 0.15) 0%, transparent 60%)',
            filter: 'blur(40px)',
          }}
        />
        {/* Corner accents */}
        <div
          className="absolute top-0 left-0 w-[300px] h-[300px]"
          style={{
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.08) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[300px] h-[300px]"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
          }}
        />
      </div>

      <Container ref={contentRef} className="relative z-10 text-center flex flex-col items-center justify-center">
        {/* Section Label */}
        <div className="flex justify-center mb-8">
          <BracketLabel>Get Started</BracketLabel>
        </div>

        {/* Heading - Unified typography */}
        <h2
          ref={headingRef}
          className="heading-section mb-6 text-3xl md:text-5xl"
        >
          Ready to Go{' '}
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
            Gasless?
          </span>
        </h2>

        {/* Description */}
        <p
          ref={descriptionRef}
          className="text-lg text-white/60 mb-12 max-w-[60ch] mx-auto leading-relaxed"
        >
          Join the future of payments. Accept stablecoins globally with zero gas fees,
          instant settlement, and enterprise-grade security.
        </p>

        {/* CTA Buttons - Unified styling */}
        <div ref={buttonsRef} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/wallet"
            className="btn-primary-unified group text-base px-8 py-4"
          >
            <span>Launch Wallet</span>
            <svg
              className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>

          <a
            href="https://github.com/DEEPESH-845/Vessel"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary-unified text-base px-8 py-4"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            <span>View on GitHub</span>
          </a>
        </div>

        {/* Trust Badges */}
        <div ref={badgesRef} className="mt-20 flex flex-wrap items-center justify-center gap-8">
          <div className="flex items-center gap-2 text-white/50 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-sm font-medium">Enterprise Security</span>
          </div>
          <div className="flex items-center gap-2 text-white/50 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm font-medium">Instant Settlement</span>
          </div>
          <div className="flex items-center gap-2 text-white/50 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">Zero Gas</span>
          </div>
        </div>
      </Container>

      {/* Decorative Element */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{
        background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent)',
      }} />
    </Section>
  );
}

export default CTASection;