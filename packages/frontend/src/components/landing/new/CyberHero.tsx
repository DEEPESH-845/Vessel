'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { Sparkles, ArrowRight } from 'lucide-react';
import { animate, stagger } from 'animejs';

export function CyberHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const titleVesselRef = useRef<HTMLHeadingElement>(null);
  const titleProtocolRef = useRef<HTMLHeadingElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // 1. Anime.js Initial Text Reveal - Sophisticated staggered glitch/blur
    if (titleVesselRef.current && titleProtocolRef.current) {
        // Split text manually for animejs
        const splitText = (el: HTMLElement) => {
            if (!el) return;
            const text = el.innerText;
            el.innerHTML = '';
            text.split('').forEach(char => {
                const span = document.createElement('span');
                span.innerText = char;
                span.style.opacity = '0';
                span.style.display = 'inline-block';
                span.style.transform = 'translateY(20px)';
                span.style.filter = 'blur(10px)';
                el.appendChild(span);
            });
        };

        splitText(titleVesselRef.current);
        splitText(titleProtocolRef.current);

        const allSpans = [
            ...Array.from(titleVesselRef.current.children),
            ...Array.from(titleProtocolRef.current.children)
        ];

        animate(allSpans, {
            opacity: [0, 1],
            translateY: [40, 0],
            filter: ['blur(15px)', 'blur(0px)'],
            scale: [0.8, 1],
            duration: 1500,
            delay: stagger(50, { start: 300 }),
            ease: 'outElastic(1, .8)'
        });
    }

    // Ensure GSAP context for proper cleanup
    let ctx = gsap.context(() => {
      // Small timeout to let the DOM settle before measuring heights for pinning
      // This is crucial for fixing reload glitches where heights are measured before rendering
      const timeout = setTimeout(() => {
        // Clean Sci-Fi Blur In for other elements
        gsap.fromTo('.hero-text-secondary',
          { y: 30, opacity: 0, filter: 'blur(15px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.5, stagger: 0.2, ease: 'power3.out', delay: 1.2 }
        );

        // Reset glow state explicitly to prevent stacking
        gsap.set('.hero-glow', { opacity: 0, scale: 0.5 });
        gsap.fromTo('.hero-glow',
          { opacity: 0, scale: 0.5 },
          { opacity: 1, scale: 1, duration: 2.5, ease: 'power2.out', delay: 0.5 }
        );

        gsap.fromTo(ctaRef.current,
          { opacity: 0, y: 30, filter: 'blur(10px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.5, ease: 'power3.out', delay: 1.6 }
        );

        // Breathing animation for the background grid
        gsap.to('.bg-grid', {
          scale: 1.05,
          opacity: 0.8,
          duration: 5,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut'
        });

        // 2. ScrollTrigger Pinning and Reveal Logic
        // Pins the hero section while breaking apart the text to reveal the next section
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: '+=150%', // Pin for 150% of viewport height
            pin: true,
            scrub: 1.5, // Smooth scrubbing
            invalidateOnRefresh: true, // Re-calculate on resize/reload
          }
        });

        // Text scales up massively, blurs, and fades out, creating a "pass through" effect
        tl.to('.hero-text-container', {
          scale: 4.5,
          opacity: 0,
          filter: 'blur(20px)',
          z: 500,
          ease: 'power2.inOut',
        }, 0);

        tl.to(ctaRef.current, {
          opacity: 0,
          y: -50,
          scale: 0.8,
          ease: 'power2.inOut',
        }, 0);

        // Background grid zooms in and fades out
        tl.to('.bg-grid', {
          scale: 2.5,
          opacity: 0,
          ease: 'power1.inOut',
        }, 0);

        tl.to('.hero-glow', {
          scale: 4,
          opacity: 0,
          ease: 'power1.inOut',
        }, 0);

        ScrollTrigger.refresh();
      }, 150);

      return () => clearTimeout(timeout);
    }, containerRef); // Scope to container

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate mouse position relative to center of screen (-1 to 1)
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;

      // Update state for direct inline style manipulation
      setMousePos({ x, y });

      // Animate the glow to follow the mouse slightly
      gsap.to('.dynamic-glow', {
        x: x * 150, // Move max 150px from center
        y: y * 150, // Move max 150px from center
        duration: 1.5,
        ease: 'power2.out'
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      ctx.revert();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-[#020202] z-10 font-sans">
      {/* Subtle scanline overlay */}
      <div className="absolute inset-0 scanlines opacity-[0.2] z-10 pointer-events-none mix-blend-overlay" />

      {/* Dynamic Radial glow that follows cursor */}
      <div className="hero-glow dynamic-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] bg-[#00ff41] rounded-full blur-[150px] mix-blend-screen pointer-events-none z-0" style={{ opacity: 0.12 }} />

      {/* Breathing Background grid - slightly softer opacity */}
      <div className="bg-grid absolute inset-0 z-0 origin-center opacity-40"
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '4vw 4vw' }}
      />

      <div ref={textContainerRef} className="relative z-20 text-center flex flex-col items-center gap-8 origin-center w-full px-4" style={{ perspective: '1200px' }}>

        {/* Pre-heading badge */}
        <div className="hero-text-secondary inline-flex items-center gap-3 px-5 py-2 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl mb-4 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
          <Sparkles className="w-4 h-4 text-[#00ff41]" />
          <span className="text-xs font-semibold tracking-[0.25em] uppercase text-white/80">Next-Gen Account Abstraction</span>
        </div>

        <div className="hero-text-container flex flex-col gap-0 items-center transform-gpu">
          <div className="overflow-visible">
            <h1 ref={titleVesselRef} className="text-[14vw] sm:text-[11vw] font-black leading-[0.8] tracking-tighter text-white inline-block origin-center transform-gpu"
                style={{ transform: `translate3d(${mousePos.x * -12}px, ${mousePos.y * -12}px, 0)` }}>
              VESSEL
            </h1>
          </div>
          <div className="overflow-visible relative mt-2">
            <h1 ref={titleProtocolRef} className="text-[14vw] sm:text-[11vw] font-black leading-[0.8] tracking-tighter text-transparent inline-block origin-center transform-gpu relative z-10"
                style={{ WebkitTextStroke: '2px rgba(255,255,255,0.8)', transform: `translate3d(${mousePos.x * -20}px, ${mousePos.y * -20}px, 0)` }}>
              PROTOCOL
            </h1>
            {/* Solid colored text layered behind the stroked text for a specific offset look, or just use solid */}
            <h1 className="absolute top-0 left-0 text-[14vw] sm:text-[11vw] font-black leading-[0.8] tracking-tighter text-[#00ff41] inline-block origin-center transform-gpu blur-[8px] opacity-40 z-0 select-none pointer-events-none"
                style={{ transform: `translate3d(${mousePos.x * -6}px, ${mousePos.y * -6}px, 0)` }}>
              PROTOCOL
            </h1>
          </div>
        </div>

        <p className="hero-text-secondary max-w-xl mt-6 text-base sm:text-lg text-white/50 font-light tracking-wide leading-[1.8]">
          Zero-gas stablecoin payments powered by AI routing and ERC-4337. Seamless cross-border transactions at the speed of thought.
        </p>

        {/* Premium CTA Button */}
        <div ref={ctaRef} className="mt-12 opacity-0">
          <button className="group relative inline-flex items-center justify-center gap-4 px-10 py-5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-[#00ff41]/50 text-white rounded-full font-medium transition-all duration-500 backdrop-blur-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            {/* Button Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#00ff41]/0 via-[#00ff41]/[0.1] to-[#00ff41]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />

            <span className="relative z-10 tracking-[0.15em] text-sm uppercase font-bold text-white/90 group-hover:text-white transition-colors duration-300">Launch App</span>
            <div className="relative z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#00ff41] group-hover:scale-110 transition-all duration-300 shadow-[inset_0_0_10px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_20px_rgba(0,255,65,0.4)]">
              <ArrowRight className="w-5 h-5 text-white group-hover:text-black transition-colors duration-300" />
            </div>
          </button>
        </div>

      </div>
    </section>
  );
}
