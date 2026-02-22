'use client';

/**
 * CinematicPlanet Component
 * Awwwards-level 3D planetary hero with custom GLSL shaders
 * Features: vertex displacement, Fresnel rim lighting, atmospheric glow, 
 * custom starfield with twinkle, orbital rings, scroll-reactive camera
 * 
 * RENDER STABILITY: High-precision, clamped values, stable animations
 */

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { gsap } from '@/lib/gsap';
import { useCursorParallax } from '@/hooks/use-cursor-parallax';
import {
  planetVertexShader,
  planetFragmentShader,
  atmosphereVertexShader,
  atmosphereFragmentShader,
  starfieldVertexShader,
  starfieldFragmentShader,
  orbitalRingVertexShader,
  orbitalRingFragmentShader,
} from '@/shaders/planet.shader';

// ═══════════════════════════════════════════════════════════════════════════════
// RENDER STABILITY CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const RENDER_CONFIG = {
  pixelRatioMax: 1.5,
  cameraNear: 0.1,
  cameraFar: 1000,
  displacementScale: 0.04, // FURTHER REDUCED for stability
  waveSpeed: 0.08, // FURTHER REDUCED for stability
  atmosphereIntensity: 0.4, // REDUCED for edge stability
  outerGlowIntensity: 0.12, // REDUCED to prevent edge bleeding
};

// ═══════════════════════════════════════════════════════════════════════════════
// COLOR PALETTE
// ═══════════════════════════════════════════════════════════════════════════════

const COLORS = {
  // Planet colors
  primary: new THREE.Color('#c1440e'),      // Deep Mars orange
  secondary: new THREE.Color('#e07830'),    // Lighter orange
  accent: new THREE.Color('#22d3ee'),       // Cyan rim light
  
  // Atmosphere colors
  atmosphereInner: new THREE.Color('#e07830'),
  atmosphereOuter: new THREE.Color('#3b82f6'),
  
  // Ring colors
  ring1: new THREE.Color('#f4a460'),
  ring2: new THREE.Color('#e07830'),
  ring3: new THREE.Color('#cd853f'),
  
  // Star color
  star: new THREE.Color('#f8fafc'),
};

// ═══════════════════════════════════════════════════════════════════════════════
// PLANET COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function Planet({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // STABILIZED: Reduced displacement and wave speed for stability
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uDisplacementScale: { value: RENDER_CONFIG.displacementScale },
    uWaveSpeed: { value: RENDER_CONFIG.waveSpeed },
    uColorPrimary: { value: COLORS.primary },
    uColorSecondary: { value: COLORS.secondary },
    uColorAccent: { value: COLORS.accent },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uResolution: { value: new THREE.Vector2(1920, 1080) },
    uRimPower: { value: 3.0 },
    uRimIntensity: { value: 1.0 }, // REDUCED for stability
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    
    if (meshRef.current) {
      // Slow Y-axis rotation
      meshRef.current.rotation.y += 0.001;
      
      // STABILIZED: Scroll-based scale adjustment (more subtle, clamped)
      const scale = Math.max(1, Math.min(1.05, 1 + scrollProgress.current * 0.05));
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef} position={[-3.5, 0, 0]}>
      <sphereGeometry args={[2.8, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={planetVertexShader}
        fragmentShader={planetFragmentShader}
        uniforms={uniforms}
        side={THREE.FrontSide}
        depthWrite={true}
        depthTest={true}
      />
    </mesh>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ATMOSPHERE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function Atmosphere({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // STABILIZED: Use RENDER_CONFIG intensity, reduced for edge stability
  const uniforms = useMemo(() => ({
    uColorInner: { value: COLORS.atmosphereInner },
    uColorOuter: { value: COLORS.atmosphereOuter },
    uIntensity: { value: RENDER_CONFIG.atmosphereIntensity },
    uPower: { value: 2.5 },
    uTime: { value: 0 },
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    
    if (meshRef.current) {
      // STABILIZED: Very slow, subtle breathing - almost imperceptible
      const pulse = Math.sin(state.clock.elapsedTime * 0.1) * 0.01 + 1.07;
      // STABILIZED: Strictly clamped scale
      const scale = Math.max(1.05, Math.min(1.10, pulse + scrollProgress.current * 0.015));
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef} position={[-3.5, 0, 0]}>
      <sphereGeometry args={[2.8, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={atmosphereVertexShader}
        fragmentShader={atmosphereFragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        depthTest={true}
      />
    </mesh>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// OUTER GLOW COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function OuterGlow() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // STABILIZED: Use RENDER_CONFIG intensity for edge stability
  const uniforms = useMemo(() => ({
    uColorInner: { value: new THREE.Color('#f4a460') },
    uColorOuter: { value: new THREE.Color('#3b82f6') },
    uIntensity: { value: RENDER_CONFIG.outerGlowIntensity },
    uPower: { value: 1.8 },
    uTime: { value: 0 },
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    
    if (meshRef.current) {
      // STABILIZED: Very slow, subtle pulse - almost static
      const pulse = Math.sin(state.clock.elapsedTime * 0.08) * 0.01 + 1.12;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <mesh ref={meshRef} position={[-3.5, 0, 0]}>
      <sphereGeometry args={[2.8, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={atmosphereVertexShader}
        fragmentShader={atmosphereFragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        depthTest={true}
      />
    </mesh>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ORBITAL RING COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function OrbitalRing({
  radius,
  tiltX,
  tiltZ,
  color,
  speed = 0,
  opacity = 0.5,
  thickness = 0.012,
}: {
  radius: number;
  tiltX: number;
  tiltZ: number;
  color: THREE.Color;
  speed?: number;
  opacity?: number;
  thickness?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const uniforms = useMemo(() => ({
    uColor: { value: color },
    uOpacity: { value: opacity },
    uTime: { value: 0 },
  }), [color, opacity]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    
    if (meshRef.current && speed) {
      meshRef.current.rotation.z += speed;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[tiltX, 0, tiltZ]}>
      <torusGeometry args={[radius, thickness, 16, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={orbitalRingVertexShader}
        fragmentShader={orbitalRingFragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ORBITAL PARTICLES COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function OrbitalParticles({
  radius,
  tiltX,
  tiltZ,
  count = 30,
  speed = 0.2,
  color = '#f4a460',
}: {
  radius: number;
  tiltX: number;
  tiltZ: number;
  count?: number;
  speed?: number;
  color?: string;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, [radius, count]);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime * speed;
      groupRef.current.rotation.z = time;
    }
  });

  return (
    <group ref={groupRef} rotation={[tiltX, 0, tiltZ]}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          color={color}
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOON COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function Moon({
  orbitRadius,
  orbitTilt,
  speed,
  offset = 0,
  color = '#4a5568',
  size = 0.12,
}: {
  orbitRadius: number;
  orbitTilt: number;
  speed: number;
  offset?: number;
  color?: string;
  size?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime * speed + offset;
      meshRef.current.position.x = Math.cos(time) * orbitRadius;
      meshRef.current.position.z = Math.sin(time) * orbitRadius * 0.4;
      meshRef.current.position.y = Math.sin(time) * orbitRadius * 0.2;
      
      if (glowRef.current) {
        glowRef.current.position.copy(meshRef.current.position);
      }
    }
  });

  return (
    <group rotation={[orbitTilt, 0, 0]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[size * 1.5, 8, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STARFIELD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function Starfield({ count = 3000 }) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const { positions, sizes, phases } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sizeArr = new Float32Array(count);
    const phaseArr = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Distribute stars in a sphere around the scene
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 40 + Math.random() * 60;
      
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
      
      sizeArr[i] = Math.random() * 1.5 + 0.5;
      phaseArr[i] = Math.random();
    }
    
    return { positions: pos, sizes: sizeArr, phases: phaseArr };
  }, [count]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.5) },
    uColor: { value: COLORS.star },
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    
    if (pointsRef.current) {
      // Very slow drift
      pointsRef.current.rotation.y += 0.00005;
      pointsRef.current.rotation.x += 0.00002;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={starfieldVertexShader}
        fragmentShader={starfieldFragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEPTH GLOWS COMPONENT - REMOVED
// Eliminated to prevent edge bleeding and viewport boundary glow overflow
// The Atmosphere and OuterGlow provide sufficient depth cues
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// CAMERA CONTROLLER
// STABILIZED: Smooth easing, clamped values, no abrupt jumps
// ═══════════════════════════════════════════════════════════════════════════════

function CameraController({ 
  cursorPosition,
  scrollProgress,
}: { 
  cursorPosition: { x: number; y: number };
  scrollProgress: React.MutableRefObject<number>;
}) {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3(0, 2, 12));
  const baseZ = 12;
  
  // STABILIZED: Very smooth lerp factors for buttery movement
  const lerpFactorX = 0.02;
  const lerpFactorY = 0.02;
  const lerpFactorZ = 0.015;
  
  useFrame(() => {
    // STABILIZED: Cursor parallax (very subtle, strictly clamped)
    const targetX = Math.max(-2, Math.min(2, cursorPosition.x * 1.2));
    const targetY = Math.max(0.5, Math.min(3.5, 2 + cursorPosition.y * 0.6));
    
    // STABILIZED: Scroll-based camera push-in (max 3% for stability)
    const scrollZ = baseZ - Math.min(scrollProgress.current * 1.5, 1.5);
    
    // Smooth lerp with different factors for each axis
    targetPosition.current.x += (targetX - targetPosition.current.x) * lerpFactorX;
    targetPosition.current.y += (targetY - targetPosition.current.y) * lerpFactorY;
    targetPosition.current.z += (scrollZ - targetPosition.current.z) * lerpFactorZ;
    
    // STABILIZED: Round to avoid micro-jitter
    camera.position.x = targetPosition.current.x;
    camera.position.y = targetPosition.current.y;
    camera.position.z = targetPosition.current.z;
    camera.lookAt(-2, 0, 0);
  });
  
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE COMPOSITION
// ═══════════════════════════════════════════════════════════════════════════════

function Scene({ 
  cursorPosition,
  scrollProgress,
}: { 
  cursorPosition: { x: number; y: number };
  scrollProgress: React.MutableRefObject<number>;
}) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[15, 10, 10]} intensity={1.0} color="#ffffff" />
      <pointLight position={[-15, -5, 5]} intensity={0.5} color="#e07830" />
      <pointLight position={[5, 5, -10]} intensity={0.3} color="#3b82f6" />

      {/* Starfield */}
      <Starfield count={3000} />

      {/* REMOVED: DepthGlows - caused edge bleeding */}

      {/* Planet with atmosphere */}
      <Planet scrollProgress={scrollProgress} />
      <Atmosphere scrollProgress={scrollProgress} />
      <OuterGlow />

      {/* Orbital Rings */}
      <OrbitalRing radius={4.2} tiltX={1.2} tiltZ={0.3} color={COLORS.ring1} speed={0.0003} opacity={0.5} />
      <OrbitalRing radius={4.8} tiltX={0.8} tiltZ={0.6} color={COLORS.ring2} speed={0.0002} opacity={0.45} />
      <OrbitalRing radius={5.4} tiltX={1.5} tiltZ={0.2} color={COLORS.ring3} speed={0.0004} opacity={0.4} />
      <OrbitalRing radius={6.0} tiltX={0.5} tiltZ={1.0} color={COLORS.ring1} speed={0.00025} opacity={0.35} />
      <OrbitalRing radius={6.6} tiltX={1.0} tiltZ={0.8} color={COLORS.ring2} speed={0.00035} opacity={0.3} />
      <OrbitalRing radius={7.2} tiltX={0.6} tiltZ={0.4} color={COLORS.ring3} speed={0.0002} opacity={0.25} />

      {/* Particle rings */}
      <OrbitalParticles radius={4.5} tiltX={1.2} tiltZ={0.3} count={30} speed={0.15} color="#f4a460" />
      <OrbitalParticles radius={5.5} tiltX={0.8} tiltZ={0.6} count={25} speed={0.12} color="#e07830" />
      <OrbitalParticles radius={6.5} tiltX={1.0} tiltZ={0.8} count={20} speed={0.1} color="#cd853f" />

      {/* Moons */}
      <Moon orbitRadius={4.2} orbitTilt={1.2} speed={0.25} offset={0} color="#4a5568" size={0.1} />
      <Moon orbitRadius={5.0} orbitTilt={0.8} speed={0.2} offset={2} color="#374151" size={0.14} />
      <Moon orbitRadius={5.8} orbitTilt={1.5} speed={0.18} offset={4} color="#1f2937" size={0.08} />
      <Moon orbitRadius={6.4} orbitTilt={0.5} speed={0.15} offset={1} color="#4b5563" size={0.11} />

      {/* Camera parallax */}
      <CameraController cursorPosition={cursorPosition} scrollProgress={scrollProgress} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export function CinematicPlanet() {
  // STABILIZED: Very smooth cursor parallax
  const cursorPosition = useCursorParallax({ smoothing: 0.05 });
  const scrollProgress = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // GSAP ScrollTrigger for scroll-reactive camera
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    const initScrollTrigger = async () => {
      const ScrollTrigger = (await import('gsap/ScrollTrigger')).ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      if (!containerRef.current) return;

      // STABILIZED: Higher scrub value for smoother scroll response
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 2, // Increased for smoother response
        onUpdate: (self) => {
          scrollProgress.current = self.progress;
        },
      });
    };

    initScrollTrigger();

    return () => {
      if (typeof window !== 'undefined') {
        import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
          ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        });
      }
    };
  }, [mounted]);

  if (!mounted) {
    return <div className="absolute inset-0" style={{ zIndex: 0 }} />;
  }

  return (
    <div ref={containerRef} className="absolute inset-0 hero-3d-canvas">
      {/* Gradient background overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 50%, transparent 0%, rgba(0,0,0,0.3) 100%),
            radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 70% 80%, rgba(34, 211, 238, 0.05) 0%, transparent 40%)
          `,
          zIndex: 1,
        }}
      />
      
      <Canvas
        camera={{ position: [0, 2, 12], fov: 50, near: RENDER_CONFIG.cameraNear, far: RENDER_CONFIG.cameraFar }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          precision: 'highp',
        }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <Scene cursorPosition={cursorPosition} scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}

export default CinematicPlanet;