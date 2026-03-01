'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { Globe2, Zap, ShieldCheck } from 'lucide-react';
import { animate, stagger } from 'animejs';

export function CyberGlobe() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const globeContainerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // 1. Text Content Fade In with Anime.js for smoother, staggered reveals
      const textElements = document.querySelectorAll('.globe-text');

      gsap.to(textElements, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          onEnter: () => {
             animate(textElements, {
                translateY: [40, 0],
                opacity: [0, 1],
                filter: ['blur(15px)', 'blur(0px)'],
                duration: 1200,
                delay: stagger(150),
                ease: 'outQuint'
             });
          }
        }
      });

      // 2. Stats Counters Animation (kept GSAP for text snapping)
      const statNumbers = document.querySelectorAll('.stat-number');
      statNumbers.forEach((stat: any) => {
        const target = parseFloat(stat.getAttribute('data-target') || '0');
        const suffix = stat.getAttribute('data-suffix') || '';

        gsap.fromTo(stat,
          { innerHTML: '0' },
          {
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
            innerHTML: target,
            duration: 2.5,
            ease: 'power3.out',
            snap: { innerHTML: 0.1 },
            onUpdate: function () {
              stat.innerHTML = Number(this.targets()[0].innerHTML).toFixed(1) + suffix;
            }
          }
        );
      });

      // 3. 3D CSS Globe Animation
      // Continual slow rotation
      gsap.to('.globe-ring-h', {
        rotationY: 360,
        duration: 30,
        repeat: -1,
        ease: 'none',
      });
      gsap.to('.globe-ring-v', {
        rotationX: 360,
        duration: 35,
        repeat: -1,
        ease: 'none',
      });
      gsap.to('.globe-ring-d1', {
        rotationZ: 360,
        duration: 40,
        repeat: -1,
        ease: 'none',
      });
      gsap.to('.globe-ring-d2', {
        rotationZ: -360,
        duration: 45,
        repeat: -1,
        ease: 'none',
      });

      // Pulse glow effect - Restored to intense state
      gsap.to('.globe-glow-center', {
        scale: 1.15,
        opacity: 0.6,
        duration: 4,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut'
      });

      // Float animation for globe container
      gsap.to(globeContainerRef.current, {
        y: -15,
        rotationX: 2,
        rotationY: -2,
        duration: 6,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut'
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-[120vh] w-full flex items-center justify-center bg-black py-32 z-20 overflow-hidden font-sans">
      {/* Background gradients for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-black pointer-events-none z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,65,0.02)_0%,transparent_60%)] pointer-events-none z-0 mix-blend-screen" />

      <div className="container mx-auto px-6 max-w-7xl relative z-20 flex flex-col lg:flex-row items-center justify-between gap-24 lg:gap-12">

        {/* Left Content */}
        <div className="lg:w-[45%] flex flex-col z-30">
          <div className="globe-text inline-flex items-center self-start gap-3 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl mb-8 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] opacity-0">
            <Globe2 className="w-4 h-4 text-[#00ff41]" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/70">Global Liquidity</span>
          </div>

          <h2 className="globe-text text-5xl md:text-7xl lg:text-[5.5rem] font-black mb-8 uppercase tracking-tighter text-white leading-[0.85] [text-wrap:balance] opacity-0">
            BORDERLESS <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white/90 to-white/30" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.4)' }}>INFRASTRUCTURE</span>
          </h2>

          <p className="globe-text text-white/50 font-light text-lg md:text-xl max-w-xl mb-14 leading-[1.8] tracking-wide opacity-0">
            The decentralized network connecting stablecoin liquidity across chains. Instantly settle cross-border payments with mathematical certainty, powered by Lisk Sepolia.
          </p>

          {/* Stats Cards */}
          <div ref={statsRef} className="globe-text grid grid-cols-2 gap-5 max-w-lg opacity-0">
            <div className="p-8 rounded-3xl bg-[#00ff41]/[0.02] border border-[#00ff41]/10 hover:bg-[#00ff41]/[0.05] hover:border-[#00ff41]/30 transition-all duration-700 ease-out group relative overflow-hidden backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00ff41]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="p-2 rounded-xl bg-[#00ff41]/10 group-hover:bg-[#00ff41]/20 transition-colors duration-500">
                  <Zap className="w-4 h-4 text-[#00ff41]" />
                </div>
                <div className="text-[#00ff41]/90 font-semibold text-xs tracking-[0.15em] uppercase">Avg. Latency</div>
              </div>
              <div className="text-white text-4xl lg:text-5xl font-black tracking-tighter group-hover:text-[#00ff41] transition-colors duration-500 relative z-10">
                <span className="stat-number" data-target="2.4" data-suffix="s">0.0s</span>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-700 ease-out group relative overflow-hidden backdrop-blur-xl">
               <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="flex items-center gap-3 mb-4 relative z-10">
                 <div className="p-2 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors duration-500">
                    <ShieldCheck className="w-4 h-4 text-white/60 group-hover:text-white transition-colors duration-500" />
                 </div>
                <div className="text-white/60 font-semibold text-xs tracking-[0.15em] uppercase group-hover:text-white/80 transition-colors duration-500">Uptime</div>
              </div>
              <div className="text-white text-4xl lg:text-5xl font-black tracking-tighter relative z-10">
                <span className="stat-number" data-target="99.9" data-suffix="%">0.0%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 3D CSS Globe */}
        <div ref={globeContainerRef} className="lg:w-[45%] w-full aspect-square max-w-[600px] relative flex items-center justify-center">

          {/* Intense center glow */}
          <div className="globe-glow-center absolute w-[60%] h-[60%] bg-[#00ff41] rounded-full blur-[120px] opacity-30 mix-blend-screen" />

          {/* CSS 3D Structure */}
          <div className="relative w-full h-full" style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}>
            {/* Outer static rings */}
            <div className="absolute inset-[5%] border border-white/[0.03] rounded-full shadow-[inset_0_0_40px_rgba(255,255,255,0.01)]" />
            <div className="absolute inset-[12%] border border-[#00ff41]/10 rounded-full border-dashed opacity-50" />

            {/* Inner rotating rings forming a sphere */}
            <div className="absolute inset-[20%]">
              <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>

                {/* Horizontal Ring */}
                <div className="globe-ring-h absolute inset-0 border border-[#00ff41]/20 rounded-full shadow-[0_0_20px_rgba(0,255,65,0.1)_inset]" style={{ transform: 'rotateX(75deg)', transformStyle: 'preserve-3d' }}>
                  {/* Orbiting particle */}
                  <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_15px_white] -translate-x-1/2 -translate-y-1/2" />
                </div>

                {/* Vertical Ring */}
                <div className="globe-ring-v absolute inset-0 border border-white/[0.15] rounded-full shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]" style={{ transform: 'rotateY(75deg)', transformStyle: 'preserve-3d' }} />

                {/* Diagonal Ring 1 */}
                <div className="globe-ring-d1 absolute inset-0 border border-[#00ff41]/30 rounded-full shadow-[0_0_30px_rgba(0,255,65,0.15)]" style={{ transform: 'rotateX(45deg) rotateY(45deg)', transformStyle: 'preserve-3d' }}>
                   {/* Orbiting particle */}
                   <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-[#00ff41] rounded-full shadow-[0_0_20px_#00ff41] -translate-x-1/2 translate-y-1/2" />
                </div>

                {/* Diagonal Ring 2 */}
                <div className="globe-ring-d2 absolute inset-0 border border-white/[0.08] rounded-full border-dotted" style={{ transform: 'rotateX(-45deg) rotateY(45deg)', transformStyle: 'preserve-3d' }} />

                {/* Core Sphere */}
                <div className="absolute inset-[30%] bg-gradient-to-br from-[#00ff41]/10 to-black rounded-full backdrop-blur-xl border border-[#00ff41]/20 shadow-[0_0_60px_rgba(0,255,65,0.15),inset_0_0_20px_rgba(0,255,65,0.1)]" />

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
