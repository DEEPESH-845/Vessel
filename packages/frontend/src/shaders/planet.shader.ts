/**
 * Planet Shader System
 * Custom GLSL shaders for cinematic planetary rendering
 * Features: vertex displacement, Fresnel rim lighting, animated noise
 */

import { simplexNoise3D } from './noise.glsl';

// ═══════════════════════════════════════════════════════════════════════════════
// PLANET VERTEX SHADER
// ═══════════════════════════════════════════════════════════════════════════════

export const planetVertexShader = /* glsl */ `
  ${simplexNoise3D}

  uniform float uTime;
  uniform float uDisplacementScale;
  uniform float uWaveSpeed;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  varying float vDisplacement;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    
    // Multi-octave noise displacement for surface detail
    // REDUCED: Slower time multipliers for stability
    float noise1 = snoise(position * 1.5 + uTime * 0.02);
    float noise2 = snoise(position * 3.0 + uTime * 0.03) * 0.5;
    float noise3 = snoise(position * 6.0 + uTime * 0.04) * 0.25;
    
    // Combine noise layers
    float totalNoise = noise1 + noise2 + noise3;
    
    // REDUCED: Breathing motion - much more subtle
    float breathing = sin(uTime * 0.15) * 0.008 + 1.0;
    
    // Calculate displacement with clamp for stability
    float displacement = clamp(totalNoise * uDisplacementScale * breathing, -0.08, 0.08);
    vDisplacement = displacement;
    
    // Apply displacement along normal
    vec3 newPosition = position + normal * displacement;
    
    // REDUCED: Slow wave distortion - much more subtle
    float wave = sin(position.y * 4.0 + uTime * uWaveSpeed * 0.3) * 0.008;
    newPosition += normal * wave;
    
    vPosition = newPosition;
    vWorldPosition = (modelMatrix * vec4(newPosition, 1.0)).xyz;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// PLANET FRAGMENT SHADER
// ═══════════════════════════════════════════════════════════════════════════════

export const planetFragmentShader = /* glsl */ `
  ${simplexNoise3D}

  uniform float uTime;
  uniform vec3 uColorPrimary;
  uniform vec3 uColorSecondary;
  uniform vec3 uColorAccent;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  uniform float uRimPower;
  uniform float uRimIntensity;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  varying float vDisplacement;
  varying vec3 vWorldPosition;

  void main() {
    // View direction for Fresnel effect
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    
    // STABILIZED: Fresnel term with smoothstep to prevent edge flicker
    // Clamp dot product to prevent extreme values at edges
    float fresnelDot = max(dot(viewDirection, vNormal), 0.0);
    // Apply smoothstep for smoother edge falloff
    float fresnelBase = 1.0 - fresnelDot;
    float fresnel = pow(fresnelBase, uRimPower);
    // STABILIZED: Clamp fresnel to safe range - prevents edge flicker
    fresnel = clamp(fresnel, 0.02, 0.92);
    // Additional smoothstep for ultra-smooth edges
    fresnel = smoothstep(0.0, 1.0, fresnel);
    
    // STABILIZED: Much slower animated surface noise - low frequency only
    float surfaceNoise = snoise(vPosition * 1.5 + uTime * 0.015) * 0.5 + 0.5;
    float detailNoise = snoise(vPosition * 4.0 + uTime * 0.02) * 0.15;
    
    // Base color gradient based on position
    float gradientY = clamp((vPosition.y + 2.0) / 4.0, 0.0, 1.0);
    vec3 baseColor = mix(uColorPrimary, uColorSecondary, gradientY);
    
    // Add noise variation to base color - REDUCED intensity
    baseColor = mix(baseColor, uColorSecondary, surfaceNoise * 0.15 + detailNoise * 0.1);
    
    // Displacement-based color variation (craters/valleys)
    float depthColor = smoothstep(-0.1, 0.1, vDisplacement);
    baseColor = mix(baseColor * 0.75, baseColor, depthColor);
    
    // STABILIZED: Rim lighting with controlled intensity
    vec3 rimColor = uColorAccent * fresnel * uRimIntensity * 0.6;
    
    // Combine colors
    vec3 finalColor = baseColor + rimColor;
    
    // STABILIZED: Subtle subsurface scattering effect
    float sss = pow(max(dot(viewDirection, -vNormal), 0.0), 3.5) * 0.08;
    finalColor += uColorSecondary * sss;
    
    // STABILIZED: Strict brightness clamp for bloom compatibility
    finalColor = clamp(finalColor, 0.0, 1.0);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// ATMOSPHERE VERTEX SHADER
// ═══════════════════════════════════════════════════════════════════════════════

export const atmosphereVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vViewDirection;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vViewDirection = normalize(cameraPosition - worldPosition.xyz);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// ATMOSPHERE FRAGMENT SHADER
// ═══════════════════════════════════════════════════════════════════════════════

export const atmosphereFragmentShader = /* glsl */ `
  uniform vec3 uColorInner;
  uniform vec3 uColorOuter;
  uniform float uIntensity;
  uniform float uPower;
  uniform float uTime;
  
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vViewDirection;

  void main() {
    // STABILIZED: Calculate Fresnel effect with smoothstep for edge stability
    float fresnelDot = max(dot(vViewDirection, vNormal), 0.0);
    float fresnelBase = 1.0 - fresnelDot;
    float fresnel = pow(fresnelBase, uPower);
    
    // STABILIZED: Clamp fresnel to safe bounds - prevents edge glow overflow
    fresnel = clamp(fresnel, 0.03, 0.88);
    // Apply smoothstep for ultra-smooth falloff
    fresnel = smoothstep(0.0, 1.0, fresnel);
    
    // Gradient from inner to outer color
    vec3 atmosphereColor = mix(uColorInner, uColorOuter, fresnel);
    
    // STABILIZED: Very slow, subtle pulse - almost imperceptible
    float pulse = sin(uTime * 0.1) * 0.015 + 1.0;
    
    // STABILIZED: Calculate final alpha with strict bounds
    // Prevents alpha extremes that cause glow bleeding
    float alpha = fresnel * uIntensity * pulse;
    alpha = clamp(alpha, 0.02, 0.82);
    
    gl_FragColor = vec4(atmosphereColor, alpha);
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// STARFIELD SHADERS
// ═══════════════════════════════════════════════════════════════════════════════

export const starfieldVertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  
  uniform float uTime;
  uniform float uPixelRatio;
  
  varying float vPhase;
  varying float vTwinkle;

  void main() {
    vPhase = aPhase;
    
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    
    // STABILIZED: Very slow twinkle - low frequency, subtle variation
    // Almost imperceptible to prevent distraction and flicker
    float twinkleSpeed = 0.15 + aPhase * 0.1;
    float twinkleRaw = sin(uTime * twinkleSpeed + aPhase * 6.28) * 0.5 + 0.5;
    
    // STABILIZED: High minimum brightness (0.75) to prevent stars from "turning off"
    // This eliminates the perception of flickering
    vTwinkle = twinkleRaw * 0.2 + 0.8; // Normalize to 0.8 - 1.0 range
    
    gl_Position = projectedPosition;
    gl_PointSize = aSize * uPixelRatio * (1.0 / -viewPosition.z) * 100.0;
  }
`;

export const starfieldFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  
  varying float vPhase;
  varying float vTwinkle;

  void main() {
    // Circular point shape with soft edge
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    
    // STABILIZED: Extra smooth falloff to reduce any flicker perception
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    alpha = smoothstep(0.0, 1.0, alpha);
    
    // Apply twinkle to alpha
    alpha *= vTwinkle;
    
    // STABILIZED: Very soft glow falloff
    alpha = pow(alpha, 1.2);
    
    // Strict clamp for stability
    alpha = clamp(alpha, 0.1, 0.95);
    
    gl_FragColor = vec4(uColor, alpha);
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// ORBITAL RING SHADERS
// ═══════════════════════════════════════════════════════════════════════════════

export const orbitalRingVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const orbitalRingFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uTime;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    // View direction for depth-based opacity
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    
    // STABILIZED: Very slow angle-based brightness - almost static
    // Prevents any perception of flicker
    float angleVariation = sin(vUv.x * 6.28 * 4.0 + uTime * 0.08) * 0.05 + 0.95;
    
    // STABILIZED: Very subtle position-based glow
    float glow = abs(sin(vPosition.x * 1.5 + uTime * 0.08)) * 0.06;
    
    vec3 finalColor = uColor * angleVariation + uColor * glow;
    
    // STABILIZED: Strict alpha bounds
    float finalAlpha = clamp(uOpacity * angleVariation, 0.1, 0.85);
    
    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`;
