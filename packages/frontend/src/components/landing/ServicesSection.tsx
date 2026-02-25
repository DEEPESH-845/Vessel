'use client';

/**
 * ServicesSection Component
 * Services section with carousel and word reveal heading
 */

import { useState, useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { BracketLabel } from './BracketLabel';
import { ServicesCarousel } from './ServicesCarousel';
import { StarField } from './StarField';

// Word-by-word text component
function WordRevealText({
  text,
  className,
}: {
  text: string;
  className?: string;
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
  }, []);

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

export function ServicesSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section
      id="services"
      className="relative min-h-screen py-24 px-6 md:px-12 overflow-hidden"
      style={{ background: '#070718' }}
    >
      {/* Star Field Background */}
      <StarField starCount={150} />

      {/* Blue Nebula Glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: '22%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 45%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Label */}
        <div className="flex justify-center mb-8">
          <BracketLabel>Our Services</BracketLabel>
        </div>

        {/* Section Heading */}
        <div className="text-center mb-16">
          <WordRevealText
            text="Tailored Solutions for Crypto and Web3 Projects to Drive Growth and Innovation"
            className="text-white font-bold leading-[1.15] max-w-3xl mx-auto text-[clamp(28px,4vw,54px)]"
          />
        </div>

        {/* Carousel */}
        <div className="flex justify-center">
          <ServicesCarousel
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
          />
        </div>
      </div>
    </section>
  );
}