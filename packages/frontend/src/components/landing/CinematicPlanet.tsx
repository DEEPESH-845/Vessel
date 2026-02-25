'use client';

/**
 * CinematicPlanet Component - IMAX Grade
 * Awwwards-level 3D planetary hero with physical atmospheric scattering
 * Features: HDR pipeline, cinematic 3-point lighting, stable rendering
 * 
 * RENDER STABILITY: High-precision, clamped values, single RAF loop
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
  outerGlowFragmentShader,
  starfieldVertexShader,
  starfieldFragmentShader,
  orbitalRingVertexShader,
  orbitalRingFragmentShader,
} from '@/shaders/planet.shader';

// ═══════════════════════════════════════════════════════════════════════════════
// NASA-GRADE HDR CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const HDR_CONFIG = {
  // Renderer settings - IMAX-grade
  outputColorSpace: THREE.SRGBColorSpace,
  toneMapping: THREE.ACESFilmicToneMapping,
  toneMappingExposure: 1.0,              // Target: 0.95-1.1 range
  
  // Stability limits - prevent flicker
  pixelRatioMax: 1.5,                    // Hard DPR cap
  cameraNear: 0.1,
  cameraFar: 500,                        // Balanced for depth precision
};

const RENDER_CONFIG = {
  // Geometry - tighter atmosphere for realism
  planetRadius: 2.8,
  atmosphereRadius: 2.87,                // 1.025x planet (realistic scale)
  outerGlowRadius: 3.05,                 // Subtle outer glow
  
  // Animation speeds - very slow for stability
  planetRotationSpeed: 0.0006,           // Slower rotation
  waveSpeed: 0.04,                       // Slower waves
  displacementScale: 0.025,              // Reduced amplitude
  
  // Atmospheric scattering - physically accurate
  rayleighCoeff: 1.4,                    // Enhanced Rayleigh for blue sky
  mieCoeff: 0.6,                         // Controlled Mie for haze
  atmosphereIntensity: 0.30,             // Subtle atmosphere
  outerGlowIntensity: 0.08,              // Minimal outer glow
  
  // Render order for proper transparency
  renderOrder: {
    planet: 0,
    atmosphere: 1,
    outerGlow: 2,
    rings: 3,
    particles: 4,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CINEMATIC COLOR PALETTE
// ═══════════════════════════════════════════════════════════════════════════════

const COLORS = {
  // Planet colors (Mars-like warm palette)
  primary: new THREE.Color('#c1440e'),
  secondary: new THREE.Color('#e07830'),
  accent: new THREE.Color('#22d3ee'),
  
  // Atmosphere colors
  atmosphereInner: new THREE.Color('#e07830'),
  atmosphereOuter: new THREE.Color('#3b82f6'),
  
  // Ring colors
  ring1: new THREE.Color('#f4a460'),
  ring2: new THREE.Color('#e07830'),
  ring3: new THREE.Color('#cd853f'),
  
  // Star color
  star: new THREE.Color('#f8fafc'),
  
  // Lighting colors
  keyLight: new THREE.Color('#fff5e6'),      // Warm key
  fillLight: new THREE.Color('#1a1a2e'),     // Dark fill
  rimLight: new THREE.Color('#4a90d9'),      // Cool rim
};

// Sun direction (normalized)
const SUN_DIRECTION = new THREE.Vector3(1, 0.5, 0.8).normalize();

// ═══════════════════════════════════════════════════════════════════════════════
// PLANET COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function Planet({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uDisplacementScale: { value: RENDER_CONFIG.displacementScale },
    uWaveSpeed: { value: RENDER_CONFIG.waveSpeed },
    uColorPrimary: { value: COLORS.primary },
    uColorSecondary: { value: COLORS.secondary },
    uColorAccent: { value: COLORS.accent },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uResolution: { value: new THREE.Vector2(1920, 1080) },
    uRimPower: { value: 3.2 },
    uRimIntensity: { value: 0.9 },
    uSunDirection: { value: SUN_DIRECTION },
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    
    if (meshRef.current) {
      // Slow Y-axis rotation
      meshRef.current.rotation.y += RENDER_CONFIG.planetRotationSpeed;
      
      // STABILIZED: Scroll-based scale (clamped)
      const scale = Math.max(1, Math.min(1.04, 1 + scrollProgress.current * 0.04));
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef} position={[-3.5, 0, 0]}>
      <sphereGeometry args={[RENDER_CONFIG.planetRadius, 128, 128]} />
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
// ATMOSPHERE COMPONENT (Physical Scattering)
// ═══════════════════════════════════════════════════════════════════════════════

function Atmosphere({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const uniforms = useMemo(() => ({
    uColorInner: { value: COLORS.atmosphereInner },
    uColorOuter: { value: COLORS.atmosphereOuter },
    uIntensity: { value: RENDER_CONFIG.atmosphereIntensity },
    uPower: { value: 2.2 },
    uTime: { value: 0 },
    uSunDirection: { value: SUN_DIRECTION },
    uRayleighCoeff: { value: RENDER_CONFIG.rayleighCoeff },
    uMieCoeff: { value: RENDER_CONFIG.mieCoeff },
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    
    if (meshRef.current) {
      // STABILIZED: Very slow, subtle breathing
      const pulse = Math.sin(state.clock.elapsedTime * 0.08) * 0.008 + 1.06;
      const scale = Math.max(1.04, Math.min(1.08, pulse + scrollProgress.current * 0.012));
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef} position={[-3.5, 0, 0]}>
      <sphereGeometry args={[RENDER_CONFIG.planetRadius, 64, 64]} />
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
  
  const uniforms = useMemo(() => ({
    uColorInner: { value: new THREE.Color('#f4a460') },
    uColorOuter: { value: new THREE.Color('#3b82f6') },
    uIntensity: { value: RENDER_CONFIG.outerGlowIntensity },
    uTime: { value: 0 },
    uSunDirection: { value: SUN_DIRECTION },
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    
    if (meshRef.current) {
      // STABILIZED: Very slow pulse
      const pulse = Math.sin(state.clock.elapsedTime * 0.06) * 0.006 + 1.10;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <mesh ref={meshRef} position={[-3.5, 0, 0]}>
      <sphereGeometry args={[RENDER_CONFIG.planetRadius, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={atmosphereVertexShader}
        fragmentShader={outerGlowFragmentShader}
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
    uSunDirection: { value: SUN_DIRECTION },
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
          size={0.035}
          color={color}
          transparent
          opacity={0.7}
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
          opacity={0.12}
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

function Starfield({ count = 2500 }) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const { positions, sizes, phases } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sizeArr = new Float32Array(count);
    const phaseArr = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 35 + Math.random() * 55;
      
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
      
      sizeArr[i] = Math.random() * 1.2 + 0.4;
      phaseArr[i] = Math.random();
    }
    
    return { positions: pos, sizes: sizeArr, phases: phaseArr };
  }, [count]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPixelRatio: { value: 1 },
    uColor: { value: COLORS.star },
  }), []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 1.5);
    }
  }, [uniforms]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.00004;
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
// CAMERA CONTROLLER (STABILIZED)
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
  
  // STABILIZED: Very smooth lerp factors
  const lerpFactorX = 0.018;
  const lerpFactorY = 0.018;
  const lerpFactorZ = 0.012;
  
  useFrame(() => {
    // STABILIZED: Cursor parallax (very subtle, strictly clamped)
    const targetX = Math.max(-1.8, Math.min(1.8, cursorPosition.x * 1.0));
    const targetY = Math.max(0.6, Math.min(3.2, 2 + cursorPosition.y * 0.5));
    
    // STABILIZED: Scroll-based camera push-in
    const scrollZ = baseZ - Math.min(scrollProgress.current * 1.2, 1.2);
    
    // Smooth lerp
    targetPosition.current.x += (targetX - targetPosition.current.x) * lerpFactorX;
    targetPosition.current.y += (targetY - targetPosition.current.y) * lerpFactorY;
    targetPosition.current.z += (scrollZ - targetPosition.current.z) * lerpFactorZ;
    
    camera.position.copy(targetPosition.current);
    camera.lookAt(-2, 0, 0);
  });
  
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HDR RENDERER SETUP
// ═══════════════════════════════════════════════════════════════════════════════

function HDRSetup() {
  const { gl } = useThree();
  
  useEffect(() => {
    // IMAX HDR Configuration
    gl.outputColorSpace = HDR_CONFIG.outputColorSpace;
    gl.toneMapping = HDR_CONFIG.toneMapping;
    gl.toneMappingExposure = HDR_CONFIG.toneMappingExposure;
    
    // Performance optimization
    gl.setPixelRatio(Math.min(window.devicePixelRatio, HDR_CONFIG.pixelRatioMax));
  }, [gl]);
  
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE COMPOSITION (3-POINT LIGHTING)
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
      {/* HDR Setup */}
      <HDRSetup />
      
      {/* ═══════════════════ CINEMATIC 3-POINT LIGHTING ═══════════════════ */}
      
      {/* KEY LIGHT - Warm main light from upper right */}
      <directionalLight
        position={[15, 10, 8]}
        intensity={1.1}
        color={COLORS.keyLight}
        castShadow={false}
      />
      
      {/* FILL LIGHT - Low ambient to prevent crushed shadows */}
      <ambientLight intensity={0.12} color={COLORS.fillLight} />
      
      {/* RIM LIGHT - Cool edge separation from behind */}
      <pointLight
        position={[-12, 5, -8]}
        intensity={0.35}
        color={COLORS.rimLight}
        distance={50}
        decay={2}
      />
      
      {/* Accent warm light for planet */}
      <pointLight
        position={[8, 5, 5]}
        intensity={0.4}
        color="#f97316"
        distance={30}
        decay={2}
      />
      
      {/* FOG - FogExp2 for depth integration */}
      <fogExp2 attach="fog" args={['#060b14', 0.012]} />
      
      {/* ═══════════════════ SCENE OBJECTS ═══════════════════ */}
      
      {/* Starfield */}
      <Starfield count={2500} />

      {/* Planet with atmosphere */}
      <Planet scrollProgress={scrollProgress} />
      <Atmosphere scrollProgress={scrollProgress} />
      <OuterGlow />

      {/* Orbital Rings */}
      <OrbitalRing radius={4.2} tiltX={1.2} tiltZ={0.3} color={COLORS.ring1} speed={0.00025} opacity={0.45} />
      <OrbitalRing radius={4.8} tiltX={0.8} tiltZ={0.6} color={COLORS.ring2} speed={0.00018} opacity={0.40} />
      <OrbitalRing radius={5.4} tiltX={1.5} tiltZ={0.2} color={COLORS.ring3} speed={0.0003} opacity={0.35} />
      <OrbitalRing radius={6.0} tiltX={0.5} tiltZ={1.0} color={COLORS.ring1} speed={0.0002} opacity={0.30} />
      <OrbitalRing radius={6.6} tiltX={1.0} tiltZ={0.8} color={COLORS.ring2} speed={0.00028} opacity={0.25} />
      <OrbitalRing radius={7.2} tiltX={0.6} tiltZ={0.4} color={COLORS.ring3} speed={0.00015} opacity={0.20} />

      {/* Particle rings */}
      <OrbitalParticles radius={4.5} tiltX={1.2} tiltZ={0.3} count={25} speed={0.12} color="#f4a460" />
      <OrbitalParticles radius={5.5} tiltX={0.8} tiltZ={0.6} count={20} speed={0.10} color="#e07830" />
      <OrbitalParticles radius={6.5} tiltX={1.0} tiltZ={0.8} count={15} speed={0.08} color="#cd853f" />

      {/* Moons */}
      <Moon orbitRadius={4.2} orbitTilt={1.2} speed={0.22} offset={0} color="#4a5568" size={0.09} />
      <Moon orbitRadius={5.0} orbitTilt={0.8} speed={0.18} offset={2} color="#374151" size={0.12} />
      <Moon orbitRadius={5.8} orbitTilt={1.5} speed={0.15} offset={4} color="#1f2937" size={0.07} />
      <Moon orbitRadius={6.4} orbitTilt={0.5} speed={0.12} offset={1} color="#4b5563" size={0.10} />

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
  const cursorPosition = useCursorParallax({ smoothing: 0.045 });
  const scrollProgress = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // GSAP ScrollTrigger
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    const initScrollTrigger = async () => {
      const ScrollTrigger = (await import('gsap/ScrollTrigger')).ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      if (!containerRef.current) return;

      // STABILIZED: Higher scrub value for smoother response
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 2.5,
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
            radial-gradient(ellipse 80% 50% at 50% 50%, transparent 0%, rgba(0,0,0,0.25) 100%),
            radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.06) 0%, transparent 40%),
            radial-gradient(circle at 70% 80%, rgba(34, 211, 238, 0.04) 0%, transparent 40%)
          `,
          zIndex: 1,
        }}
      />
      
      {/* Cinematic vignette overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.15) 100%)',
          zIndex: 2,
        }}
      />
      
      <Canvas
        camera={{ 
          position: [0, 2, 12], 
          fov: 50, 
          near: HDR_CONFIG.cameraNear, 
          far: HDR_CONFIG.cameraFar 
        }}
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