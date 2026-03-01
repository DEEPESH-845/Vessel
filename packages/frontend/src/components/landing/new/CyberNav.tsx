'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { animate, stagger } from 'animejs';

export function CyberNav() {
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Entrance animation
    if (navRef.current) {
        animate(navRef.current, {
          translateY: [-20, 0],
          opacity: [0, 1],
          duration: 1000,
          ease: 'outExpo',
          delay: 200
        });
    }

    if (logoRef.current && linksRef.current) {
       animate([logoRef.current, ...Array.from(linksRef.current.children)], {
        translateY: [-10, 0],
        opacity: [0, 1],
        duration: 800,
        delay: stagger(100, { start: 400 }),
        ease: 'outQuad'
      });
    }


    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] font-sans opacity-0
        ${scrolled
          ? 'py-4 bg-black/50 backdrop-blur-3xl border-b border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.4)] supports-[backdrop-filter]:bg-black/30'
          : 'py-8 bg-transparent border-transparent'
        }
      `}
    >
      <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">

        {/* Logo Section */}
        <Link ref={logoRef} href="/" className="group flex items-center gap-4 relative opacity-0">
          <div className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 overflow-hidden transition-all duration-500 group-hover:border-[#00ff41]/50 group-hover:bg-[#00ff41]/5">
             <div className="absolute inset-0 bg-[#00ff41] rounded-full opacity-20 group-hover:opacity-40 blur-xl transition-all duration-500 transform scale-150" />
             <div className="relative w-2.5 h-2.5 bg-[#00ff41] rounded-full shadow-[0_0_15px_#00ff41] transition-transform duration-500 group-hover:scale-125" />
          </div>
          <span className="text-xl font-black text-white tracking-tighter uppercase leading-none mt-1 transition-colors duration-300 group-hover:text-white/90">
            VESSEL
          </span>
        </Link>

        {/* Center decorative line (hidden on mobile) */}
        <div className={`hidden md:flex flex-1 max-w-lg mx-12 transition-all duration-700 ease-out origin-center ${scrolled ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-75'}`}>
           <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Right Actions */}
        <div ref={linksRef} className="flex items-center gap-8">
          <Link
            href="/docs"
            className="hidden sm:block text-xs font-semibold tracking-widest uppercase text-white/50 hover:text-white transition-colors duration-300 opacity-0"
          >
            Developers
          </Link>

          <Link href="/login" className="group relative inline-flex items-center justify-center gap-3 px-6 py-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-[#00ff41]/40 text-white rounded-full font-medium transition-all duration-500 overflow-hidden backdrop-blur-md opacity-0">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00ff41]/0 via-[#00ff41]/[0.08] to-[#00ff41]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />

            <span className="relative z-10 text-xs font-bold tracking-widest uppercase text-white/90 group-hover:text-white transition-colors">Launch App</span>
            <div className="relative z-10 flex items-center justify-center w-5 h-5 rounded-full bg-white/10 group-hover:bg-[#00ff41] transition-colors duration-300">
               <ArrowRight className="w-3 h-3 text-white group-hover:text-black transition-colors duration-300" />
            </div>
          </Link>
        </div>

      </div>
    </nav>
  );
}
