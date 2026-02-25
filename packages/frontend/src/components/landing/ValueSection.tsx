'use client';

/**
 * ValueSection Component
 * Value proposition section with consistent visual design
 */

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { BracketLabel } from './BracketLabel';
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

      gsap.set(words, { color: 'rgba(255,255,255,0.18)' });

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

const values = [
  {
    title: 'Gasless Transactions',
    description: 'ERC-4337 Paymaster sponsors all gas fees. Users never need to hold ETH or native tokens.',
    icon: '⚡',
  },
  {
    title: 'AI-Powered Routing',
    description: 'Bedrock agents select optimal liquidity pools. SageMaker models predict gas prices.',
    icon: '🤖',
  },
  {
    title: 'Instant Settlement',
    description: 'Funds arrive in your preferred stablecoin within 15 seconds. No waiting.',
    icon: '🚀',
  },
  {
    title: 'Enterprise Security',
    description: 'AWS KMS key management, backend-signed authorizations, and real-time fraud detection.',
    icon: '🔒',
  },
];

export function ValueSection() {
  return (
    <section
      id="value"
      className="relative min-h-screen py-24 px-6 md:px-12 overflow-hidden bg-black"
    >
      {/* Star Field Background */}
      <StarField starCount={100} />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Label */}
        <div className="flex justify-center mb-8">
          <BracketLabel>Our Value</BracketLabel>
        </div>

        {/* Section Heading */}
        <div className="text-center mb-16">
          <WordRevealText
            text="Why Choose Vessel for Your Gasless Payment Journey"
            className="text-white font-bold leading-[1.15] max-w-3xl mx-auto text-[clamp(28px,4vw,54px)]"
          />
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <div
              key={index}
              className="relative p-6 rounded-2xl"
              style={{
                background: 'rgba(8, 8, 26, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div className="text-4xl mb-4">{value.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}