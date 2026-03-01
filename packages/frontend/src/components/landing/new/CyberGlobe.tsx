'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/animations/gsap-config';
import { Globe2, Zap, ShieldCheck } from 'lucide-react';
import { animate, stagger } from 'animejs';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Torus, Html } from '@react-three/drei';
import * as THREE from 'three';

// ----------------------------------------------------------------------
// R3F Scene Component
// ----------------------------------------------------------------------
function GlobeScene({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const ringHRef = useRef<THREE.Mesh>(null);
  const ringVRef = useRef<THREE.Mesh>(null);
  const ringD1Ref = useRef<THREE.Mesh>(null);
  const ringD2Ref = useRef<THREE.Mesh>(null);

  // Use the same rotation speeds as the original GSAP animation
  useFrame((state, delta) => {
    if (!groupRef.current || reducedMotion) return;

    // Horizontal Ring (30s = 360deg -> 12deg/s)
    if (ringHRef.current) ringHRef.current.rotation.y -= delta * (Math.PI * 2 / 30);
    // Vertical Ring (35s = 360deg)
    if (ringVRef.current) ringVRef.current.rotation.x -= delta * (Math.PI * 2 / 35);
    // Diagonal Ring 1 (40s = 360deg)
    if (ringD1Ref.current) ringD1Ref.current.rotation.z -= delta * (Math.PI * 2 / 40);
    // Diagonal Ring 2 (-360deg / 45s)
    if (ringD2Ref.current) ringD2Ref.current.rotation.z += delta * (Math.PI * 2 / 45);
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={1.5} />

      {/* Horizontal Ring */}
      <Torus ref={ringHRef} args={[2.5, 0.015, 16, 100]} rotation={[Math.PI / 2.4, 0, 0]}>
        <meshBasicMaterial color="#00ff41" transparent opacity={0.3} />
        {/* Orbiting particle */}
        <mesh position={[0, 2.5, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </Torus>

      {/* Vertical Ring */}
      <Torus ref={ringVRef} args={[2.5, 0.015, 16, 100]} rotation={[0, Math.PI / 2.4, 0]}>
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
      </Torus>

      {/* Diagonal Ring 1 */}
      <Torus ref={ringD1Ref} args={[2.5, 0.02, 16, 100]} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <meshBasicMaterial color="#00ff41" transparent opacity={0.4} />
        {/* Orbiting particle */}
        <mesh position={[0, -2.5, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="#00ff41" />
        </mesh>
      </Torus>

      {/* Diagonal Ring 2 (Dashed/Dotted equivalent) */}
      <Torus ref={ringD2Ref} args={[2.5, 0.01, 16, 100]} rotation={[-Math.PI / 4, Math.PI / 4, 0]}>
        <meshBasicMaterial color="#ffffff" transparent opacity={0.1} wireframe />
      </Torus>

      {/* Static Outer Rings */}
      <Torus args={[3.2, 0.01, 16, 100]} rotation={[0, 0, 0]}>
        <meshBasicMaterial color="#ffffff" transparent opacity={0.03} />
      </Torus>
      <Torus args={[2.9, 0.01, 16, 100]} rotation={[0, 0, 0]}>
        <meshBasicMaterial color="#00ff41" transparent opacity={0.1} wireframe />
      </Torus>

      {/* Core Sphere */}
      <Sphere args={[1.5, 64, 64]}>
        <meshPhysicalMaterial
          color="#000000"
          emissive="#00ff41"
          emissiveIntensity={0.1}
          transmission={0.9}
          opacity={1}
          transparent
          roughness={0.1}
          ior={1.5}
          thickness={2}
        />
      </Sphere>
    </group>
  );
}

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
export function CyberGlobe() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const globeContainerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Small timeout to allow the previous pinned section to render its spacer
      const timeout = setTimeout(() => {
        // 1. Text Content Fade In with Anime.js for smoother, staggered reveals
        const textElements = document.querySelectorAll('.globe-text');

        // Reset opacity manually before triggering just in case
        gsap.set(textElements, { opacity: 0 });

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top 75%',
          onEnter: () => {
            // Let Anime handle the actual styling overrides
            animate(textElements, {
              translateY: reducedMotion ? [10, 0] : [40, 0],
              opacity: [0, 1],
              filter: reducedMotion ? ['blur(0px)', 'blur(0px)'] : ['blur(15px)', 'blur(0px)'],
              duration: reducedMotion ? 200 : 1200,
              delay: reducedMotion ? 50 : stagger(150),
              ease: 'outQuint'
            });
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
              duration: reducedMotion ? 0.01 : 2.5,
              ease: 'power3.out',
              snap: { innerHTML: 0.1 },
              onUpdate: function () {
                stat.innerHTML = Number(this.targets()[0].innerHTML).toFixed(1) + suffix;
              }
            }
          );
        });

        // Pulse glow effect - Restored to intense state
        if (reducedMotion) {
          gsap.set('.globe-glow-center', { scale: 1.15, opacity: 0.6 });
        } else {
          gsap.to('.globe-glow-center', {
            scale: 1.15,
            opacity: 0.6,
            duration: 4,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut'
          });
        }

        // Float animation for globe container
        if (reducedMotion) {
          gsap.set(globeContainerRef.current, { y: 0, rotationX: 0, rotationY: 0 });
        } else {
          gsap.to(globeContainerRef.current, {
            y: -15,
            rotationX: 2,
            rotationY: -2,
            duration: 6,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut'
          });
        }

        ScrollTrigger.refresh();
      }, 200);

      return () => clearTimeout(timeout);
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

        {/* Right 3D R3F Globe */}
        <div ref={globeContainerRef} className="lg:w-[45%] w-full aspect-square max-w-[600px] relative flex items-center justify-center">

          {/* Intense center glow (HTML layer behind canvas) */}
          <div className="globe-glow-center absolute w-[60%] h-[60%] bg-[#00ff41] rounded-full blur-[120px] opacity-30 mix-blend-screen pointer-events-none" />

          {/* WebGL Canvas */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
              <GlobeScene reducedMotion={typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false} />
            </Canvas>
          </div>


        </div>
      </div>
    </section>
  );
}
