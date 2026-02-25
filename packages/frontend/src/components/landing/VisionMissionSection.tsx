'use client';

/**
 * VisionMissionSection Component
 * Vision and Mission section with consistent visual design
 */

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { BracketLabel } from './BracketLabel';
import { StarField } from './StarField';
import Link from 'next/link';

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

export function VisionMissionSection() {
  return (
    <section
      id="vision"
      className="relative min-h-screen py-24 px-6 md:px-12 overflow-hidden"
      style={{ background: '#04040A' }}
    >
      {/* Star Field Background */}
      <StarField starCount={100} />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Label */}
        <div className="flex justify-center mb-8">
          <BracketLabel>Vision & Mission</BracketLabel>
        </div>

        {/* Section Heading */}
        <div className="text-center mb-16">
          <WordRevealText
            text="Building the Bridge Between Innovation and Opportunity"
            className="text-white font-bold leading-[1.15] max-w-3xl mx-auto text-[clamp(28px,4vw,54px)]"
          />
        </div>

        {/* Vision and Mission Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Vision */}
          <div
            className="relative p-8 rounded-2xl"
            style={{
              background: 'rgba(8, 8, 26, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent"
            >
              Our Vision
            </div>
            <p className="text-white/65 leading-relaxed">
              To be the leading catalyst for Web3 and cryptocurrency adoption in the Arab world, 
              empowering communities with knowledge and connecting innovative projects with the 
              resources they need to thrive.
            </p>
          </div>

          {/* Mission */}
          <div
            className="relative p-8 rounded-2xl"
            style={{
              background: 'rgba(8, 8, 26, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              className="text-2xl font-bold mb-4 bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent"
            >
              Our Mission
            </div>
            <p className="text-white/65 leading-relaxed">
              To deliver exceptional marketing and strategic services that bridge the gap between 
              cutting-edge blockchain technology and the Arab market, fostering growth, education, 
              and meaningful connections across the MENA region.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div
            className="inline-block p-10 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(129, 140, 248, 0.1) 100%)',
              border: '1px solid rgba(249, 115, 22, 0.2)',
            }}
          >
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Transform Your Web3 Presence?
            </h3>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">
              Let's discuss how Tech Valley can help your project reach its full potential in the Arab market.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(90deg, #F97316, #818CF8)',
                boxShadow: '0 4px 24px rgba(249, 115, 22, 0.4)',
              }}
            >
              Get Started Today
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}