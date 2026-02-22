'use client';

/**
 * AboutSection Component
 * Two-column layout with text reveal animation and 3D model
 */

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { BracketLabel } from './BracketLabel';

// Word-by-word text component
function WordRevealText({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(require('gsap/ScrollTrigger').ScrollTrigger);
    const ScrollTrigger = require('gsap/ScrollTrigger').ScrollTrigger;

    if (containerRef.current) {
      const words = containerRef.current.querySelectorAll('.word');

      // Set initial state - faded
      gsap.set(words, { color: 'rgba(255,255,255,0.18)' });

      // Animate to white on scroll
      gsap.to(words, {
        color: 'rgba(255,255,255,1)',
        duration: 0.5,
        stagger: 0.045,
        ease: 'power2.out',
        delay,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%',
          end: 'bottom 40%',
          scrub: 0.8,
        },
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger: { kill: () => void }) => trigger.kill());
    };
  }, [delay]);

  const words = text.split(' ');

  return (
    <div ref={containerRef} className={className}>
      {words.map((word, index) => (
        <span key={index} className="word inline-block">
          {word}
          {index < words.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </div>
  );
}

// 3D Spacecraft component
function SpacecraftModel() {
  useEffect(() => {
    // Animation handled by CSS
  }, []);

  return (
    <div className="relative w-full h-[400px] md:h-[500px]">
      {/* Placeholder for 3D model - using CSS animation for now */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="relative w-48 h-48 animate-float"
          style={{
            animation: 'float 4s ease-in-out infinite',
          }}
        >
          {/* Spacecraft shape using CSS */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg transform rotate-45 shadow-2xl shadow-orange-500/30" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg transform rotate-45" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg transform rotate-45 shadow-lg shadow-blue-500/50" />
        </div>
      </div>

      {/* Glow effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(224,120,48,0.15) 0%, transparent 60%)',
        }}
      />
    </div>
  );
}

export function AboutSection() {
  return (
    <section
      id="about"
      className="relative min-h-screen py-24 px-6 md:px-12 bg-black"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Text */}
          <div className="space-y-8">
            {/* Bracket Label */}
            <BracketLabel>What We</BracketLabel>

            {/* Main Heading */}
            <WordRevealText
              text="Shaping the Future of Web3 and Crypto with Innovative Marketing and Strategic Expertise"
              className="text-white font-bold leading-[1.15] text-[clamp(32px,4vw,54px)]"
            />

            {/* Subheading */}
            <h3 className="text-lg font-bold text-white">
              Comprehensive Marketing & Advertising
            </h3>

            {/* Body Text */}
            <p className="text-white/65 text-[15px] leading-relaxed max-w-lg">
              We specialize in designing integrated marketing experiences that connect all key stakeholders, from early investors to project execution and post-launch marketing. Our innovative strategies help bring cutting-edge technologies to the Arab community through content that drives foresighted investments.
            </p>
          </div>

          {/* Right Column - 3D Model */}
          <div className="relative">
            <SpacecraftModel />
          </div>
        </div>
      </div>
    </section>
  );
}