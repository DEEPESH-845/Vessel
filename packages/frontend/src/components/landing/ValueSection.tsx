'use client';

/**
 * ValueSection Component
 * Value proposition section with consistent visual design
 */

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { BracketLabel } from './BracketLabel';
import { StarField } from './StarField';
import { Container } from '../layout/Container';
import { Section } from '../layout/Section';

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
    <Section
      id="value"
      className="relative min-h-screen overflow-hidden bg-black"
    >
      {/* Star Field Background */}
      <StarField starCount={100} />

      <Container className="relative z-10">
        {/* Section Label */}
        <div className="flex justify-center mb-8">
          <BracketLabel>Our Value</BracketLabel>
        </div>

        {/* Section Heading */}
        <div className="text-center mb-16 md:mb-24">
          <WordRevealText
            text="Why Choose Vessel for Your Gasless Payment Journey"
            className="text-white font-bold leading-tight max-w-4xl mx-auto text-3xl md:text-5xl"
          />
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {values.map((value, index) => (
            <div
              key={index}
              className="relative p-8 rounded-2xl flex flex-col items-start"
              style={{
                background: 'rgba(8, 8, 26, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div className="text-4xl mb-6">{value.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">{value.title}</h3>
              <p className="text-base text-white/60 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}