'use client';

/**
 * OrbitalSystem Component
 * Cinematic 3D planet with orbital rings, moons, and cursor parallax
 * Inspired by premium Web3 landing pages
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useCursorParallax } from '@/hooks/use-cursor-parallax';

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// Main Planet with atmospheric glow
function Planet() {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const innerGlowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle rotation
      meshRef.current.rotation.y += 0.0008;
    }
    if (glowRef.current) {
      // Pulsing glow
      const pulse = Math.sin(state.clock.elapsedTime * 0.5) * 0.02 + 1;
      glowRef.current.scale.setScalar(1.08 * pulse);
    }
    if (innerGlowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 0.7) * 0.01 + 1;
      innerGlowRef.current.scale.setScalar(1.03 * pulse);
    }
  });

  return (
    <group position={[-3.5, 0, 0]}>
      {/* Main planet body */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2.8, 64, 64]} />
        <meshStandardMaterial
          color="#c1440e"
          roughness={0.75}
          metalness={0.15}
          emissive="#c1440e"
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* Inner atmospheric glow */}
      <mesh ref={innerGlowRef}>
        <sphereGeometry args={[2.8, 32, 32]} />
        <meshBasicMaterial
          color="#e07830"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer atmospheric glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[2.8, 32, 32]} />
        <meshBasicMaterial
          color="#f4a460"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// Orbital Ring with glow
function OrbitalRing({
  radius,
  tiltX,
  tiltZ,
  color = '#e07830',
  speed = 0,
  opacity = 0.55,
}: {
  radius: number;
  tiltX: number;
  tiltZ: number;
  color?: string;
  speed?: number;
  opacity?: number;
}) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (ringRef.current && speed) {
      ringRef.current.rotation.z += speed;
    }
  });

  return (
    <mesh ref={ringRef} rotation={[tiltX, 0, tiltZ]}>
      <torusGeometry args={[radius, 0.012, 16, 128]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={opacity}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Glowing particles along orbits
function OrbitalParticles({
  radius,
  tiltX,
  tiltZ,
  count = 20,
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
        />
      </points>
    </group>
  );
}

// Moon with orbital motion
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
        />
      </mesh>
    </group>
  );
}

// Depth glow spheres for atmospheric effect
function DepthGlows() {
  return (
    <group>
      {/* Primary glow behind planet */}
      <mesh position={[-5, 1, -3]}>
        <sphereGeometry args={[2, 16, 16]} />
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Cyan accent glow */}
      <mesh position={[3, -2, -5]}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshBasicMaterial
          color="#22d3ee"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Orange accent glow */}
      <mesh position={[-1, 3, -4]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color="#f97316"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// Camera controller with cursor parallax
function CameraController({ cursorPosition }: { cursorPosition: { x: number; y: number } }) {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3(0, 2, 12));
  
  useFrame(() => {
    // Subtle camera movement based on cursor
    const targetX = cursorPosition.x * 1.5;
    const targetY = 2 + cursorPosition.y * 0.8;
    
    targetPosition.current.x += (targetX - targetPosition.current.x) * 0.05;
    targetPosition.current.y += (targetY - targetPosition.current.y) * 0.05;
    
    camera.position.x = targetPosition.current.x;
    camera.position.y = targetPosition.current.y;
    camera.lookAt(-2, 0, 0);
  });
  
  return null;
}

// Main scene composition
function Scene({ cursorPosition }: { cursorPosition: { x: number; y: number } }) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.25} />
      <pointLight position={[15, 10, 10]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-15, -5, 5]} intensity={0.6} color="#e07830" />
      <pointLight position={[5, 5, -10]} intensity={0.3} color="#3b82f6" />

      {/* Stars background */}
      <Stars 
        radius={100} 
        depth={50} 
        count={2500} 
        factor={4} 
        saturation={0} 
        fade 
        speed={0.5} 
      />

      {/* Depth glows */}
      <DepthGlows />

      {/* Planet */}
      <Planet />

      {/* Orbital Rings with varying properties */}
      <OrbitalRing radius={4.2} tiltX={1.2} tiltZ={0.3} color="#f4a460" speed={0.0003} opacity={0.5} />
      <OrbitalRing radius={4.8} tiltX={0.8} tiltZ={0.6} color="#e07830" speed={0.0002} opacity={0.45} />
      <OrbitalRing radius={5.4} tiltX={1.5} tiltZ={0.2} color="#cd853f" speed={0.0004} opacity={0.4} />
      <OrbitalRing radius={6.0} tiltX={0.5} tiltZ={1.0} color="#daa520" speed={0.00025} opacity={0.35} />
      <OrbitalRing radius={6.6} tiltX={1.0} tiltZ={0.8} color="#f4a460" speed={0.00035} opacity={0.3} />
      <OrbitalRing radius={7.2} tiltX={0.6} tiltZ={0.4} color="#e07830" speed={0.0002} opacity={0.25} />

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
      <CameraController cursorPosition={cursorPosition} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export function OrbitalSystem() {
  const cursorPosition = useCursorParallax({ smoothing: 0.08 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="absolute inset-0" style={{ zIndex: 0 }} />;
  }

  return (
    <div className="absolute inset-0 hero-3d-canvas">
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
        camera={{ position: [0, 2, 12], fov: 50 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <Scene cursorPosition={cursorPosition} />
      </Canvas>
    </div>
  );
}

export default OrbitalSystem;