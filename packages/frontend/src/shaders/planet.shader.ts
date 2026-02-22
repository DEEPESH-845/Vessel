/**
 * Planet Shader System - IMAX Grade
 * Custom GLSL shaders for cinematic planetary rendering
 * Features: Physical atmospheric scattering, HDR color grading, stable rendering
 */

import { simplexNoise3D } from './noise.glsl';
import {
  atmosphericConstants,
  phaseFunctions,
  atmosphericDepth,
  atmosphericScattering,
} from './atmospheric-scattering.glsl';
import {
  toneMapping,
  cinematicColorGrading,
  colorGradingPipeline,
  colorGradePresets,
} from './color-grading.glsl';

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
    // STABILIZED: Slower time multipliers for stability
    float noise1 = snoise(position * 1.5 + uTime * 0.015);
    float noise2 = snoise(position * 3.0 + uTime * 0.02) * 0.5;
    float noise3 = snoise(position * 6.0 + uTime * 0.025) * 0.25;
    
    // Combine noise layers
    float totalNoise = noise1 + noise2 + noise3;
    
    // STABILIZED: Breathing motion - subtle, low frequency
    float breathing = sin(uTime * 0.12) * 0.006 + 1.0;
    
    // STABILIZED: Calculate displacement with strict clamp
    float displacement = clamp(totalNoise * uDisplacementScale * breathing, -0.06, 0.06);
    vDisplacement = displacement;
    
    // Apply displacement along normal
    vec3 newPosition = position + normal * displacement;
    
    // STABILIZED: Slow wave distortion - very subtle
    float wave = sin(position.y * 3.0 + uTime * uWaveSpeed * 0.2) * 0.005;
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
  ${colorGradingPipeline}
  ${colorGradePresets}

  uniform float uTime;
  uniform vec3 uColorPrimary;
  uniform vec3 uColorSecondary;
  uniform vec3 uColorAccent;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  uniform float uRimPower;
  uniform float uRimIntensity;
  uniform vec3 uSunDirection;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  varying float vDisplacement;
  varying vec3 vWorldPosition;

  void main() {
    // STABILIZED: View direction calculation
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    vec3 sunDir = normalize(uSunDirection);
    vec3 normal = normalize(vNormal);
    
    // STABILIZED: Fresnel term with smoothstep to prevent edge flicker
    float fresnelDot = max(dot(viewDirection, normal), 0.0);
    float fresnelBase = 1.0 - fresnelDot;
    
    // STABILIZED: Apply smoothstep before power for ultra-smooth edges
    float fresnelSmooth = smoothstep(0.0, 1.0, fresnelBase);
    float fresnel = pow(fresnelSmooth, uRimPower);
    
    // STABILIZED: Clamp fresnel to safe range
    fresnel = clamp(fresnel, 0.02, 0.88);
    
    // STABILIZED: Slow animated surface noise - low frequency only
    float surfaceNoise = snoise(vPosition * 1.2 + uTime * 0.01) * 0.5 + 0.5;
    float detailNoise = snoise(vPosition * 3.5 + uTime * 0.015) * 0.12;
    
    // Base color gradient based on position
    float gradientY = clamp((vPosition.y + 2.0) / 4.0, 0.0, 1.0);
    vec3 baseColor = mix(uColorPrimary, uColorSecondary, gradientY);
    
    // Add noise variation to base color - REDUCED intensity
    baseColor = mix(baseColor, uColorSecondary, surfaceNoise * 0.12 + detailNoise * 0.08);
    
    // Displacement-based color variation (craters/valleys)
    float depthColor = smoothstep(-0.08, 0.08, vDisplacement);
    baseColor = mix(baseColor * 0.8, baseColor, depthColor);
    
    // STABILIZED: Lighting calculation
    float diffuse = max(dot(normal, sunDir), 0.0);
    diffuse = diffuse * 0.6 + 0.4; // Soft wrap lighting
    
    // Apply diffuse to base color
    vec3 litColor = baseColor * diffuse;
    
    // STABILIZED: Rim lighting with controlled intensity
    vec3 rimColor = uColorAccent * fresnel * uRimIntensity * 0.5;
    
    // Combine colors
    vec3 finalColor = litColor + rimColor;
    
    // STABILIZED: Subtle subsurface scattering effect
    float sss = pow(max(dot(viewDirection, -normal), 0.0), 4.0) * 0.06;
    finalColor += uColorSecondary * sss;
    
    // STABILIZED: Apply cinematic color grading
    finalColor = gradePlanetSurface(finalColor);
    
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
  varying vec3 vPositionLocal;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vPositionLocal = position;
    vViewDirection = normalize(cameraPosition - worldPosition.xyz);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// ATMOSPHERE FRAGMENT SHADER (Physical Scattering)
// ═══════════════════════════════════════════════════════════════════════════════

export const atmosphereFragmentShader = /* glsl */ `
  ${atmosphericConstants}
  ${phaseFunctions}
  ${atmosphericDepth}
  ${atmosphericScattering}
  
  uniform vec3 uSunDirection;
  uniform vec3 uColorInner;
  uniform vec3 uColorOuter;
  uniform float uIntensity;
  uniform float uPower;
  uniform float uTime;
  uniform float uRayleighCoeff;
  uniform float uMieCoeff;
  
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vViewDirection;
  varying vec3 vPositionLocal;

  void main() {
    // STABILIZED: Normalize all direction vectors
    vec3 viewDir = normalize(vViewDirection);
    vec3 sunDir = normalize(uSunDirection);
    vec3 normal = normalize(vNormal);
    
    // STABILIZED: Calculate Fresnel with smoothstep for edge stability
    float fresnelDot = max(dot(viewDir, normal), 0.0);
    float fresnelBase = 1.0 - fresnelDot;
    
    // STABILIZED: Apply smoothstep before power to prevent edge flicker
    float fresnelSmooth = smoothstep(0.0, 1.0, fresnelBase);
    float fresnel = pow(fresnelSmooth, uPower);
    
    // STABILIZED: Clamp fresnel to safe bounds - prevents edge glow overflow
    fresnel = clamp(fresnel, 0.02, 0.85);
    
    // Calculate physical atmospheric scattering
    vec3 scattering = calculateAtmosphericScatteringFast(
      vPositionLocal,
      -viewDir,
      sunDir,
      uRayleighCoeff,
      uMieCoeff
    );
    
    // STABILIZED: Blend between inner and outer atmosphere colors
    vec3 atmosphereColor = mix(uColorInner, uColorOuter, fresnel);
    
    // STABILIZED: Add physical scattering contribution
    atmosphereColor += scattering * 0.25;
    
    // STABILIZED: Very slow, subtle pulse animation - low frequency only
    float pulse = sin(uTime * 0.06) * 0.006 + 1.0;
    
    // STABILIZED: Calculate final alpha with strict bounds
    float alpha = fresnel * uIntensity * pulse;
    
    // STABILIZED: Additional rim glow at grazing angles
    float rimGlow = pow(fresnel, 3.5) * 0.12;
    alpha += rimGlow;
    
    // STABILIZED: Final clamping for bloom stability
    alpha = clamp(alpha, 0.02, 0.78);
    atmosphereColor = clamp(atmosphereColor, 0.0, 1.0);
    
    gl_FragColor = vec4(atmosphereColor, alpha);
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// OUTER GLOW FRAGMENT SHADER
// ═══════════════════════════════════════════════════════════════════════════════

export const outerGlowFragmentShader = /* glsl */ `
  ${atmosphericConstants}
  ${phaseFunctions}
  
  uniform vec3 uColorInner;
  uniform vec3 uColorOuter;
  uniform float uIntensity;
  uniform float uTime;
  uniform vec3 uSunDirection;
  
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vViewDirection;
  varying vec3 vPositionLocal;

  void main() {
    // STABILIZED: Normalize directions
    vec3 viewDir = normalize(vViewDirection);
    vec3 sunDir = normalize(uSunDirection);
    vec3 normal = normalize(vNormal);
    
    // STABILIZED: Fresnel with extra smoothing for outer glow
    float fresnelDot = max(dot(viewDir, normal), 0.0);
    float fresnelBase = 1.0 - fresnelDot;
    float fresnelSmooth = smoothstep(0.0, 1.0, fresnelBase);
    float fresnel = pow(fresnelSmooth, 1.6);
    
    // STABILIZED: Clamp to prevent edge bleeding
    fresnel = clamp(fresnel, 0.01, 0.65);
    
    // Color gradient
    vec3 glowColor = mix(uColorInner, uColorOuter, fresnel);
    
    // STABILIZED: Subtle forward scattering glow toward sun
    float cosTheta = dot(-viewDir, sunDir);
    float mieGlow = henyeyGreensteinPhase(cosTheta, 0.55) * 0.08;
    glowColor += vec3(mieGlow) * fresnel;
    
    // STABILIZED: Static opacity (minimal animation)
    float alpha = fresnel * uIntensity;
    alpha = clamp(alpha, 0.01, 0.45);
    
    gl_FragColor = vec4(clamp(glowColor, 0.0, 1.0), alpha);
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
    float twinkleSpeed = 0.12 + aPhase * 0.08;
    float twinkleRaw = sin(uTime * twinkleSpeed + aPhase * 6.28) * 0.5 + 0.5;
    
    // STABILIZED: High minimum brightness (0.82) to prevent flickering
    vTwinkle = twinkleRaw * 0.15 + 0.85;
    
    gl_Position = projectedPosition;
    gl_PointSize = aSize * uPixelRatio * (1.0 / -viewPosition.z) * 100.0;
    gl_PointSize = clamp(gl_PointSize, 1.0, 8.0);
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
    alpha = pow(alpha, 1.15);
    
    // Strict clamp for stability
    alpha = clamp(alpha, 0.1, 0.92);
    
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
  uniform vec3 uSunDirection;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    // View direction for depth-based opacity
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    vec3 sunDir = normalize(uSunDirection);
    
    // STABILIZED: Very slow angle-based brightness
    float angleVariation = sin(vUv.x * 6.28 * 3.0 + uTime * 0.05) * 0.03 + 0.97;
    
    // STABILIZED: Subtle lighting from sun
    float sunLight = max(dot(normalize(vNormal), sunDir), 0.0) * 0.2 + 0.8;
    
    // STABILIZED: Very subtle position-based glow
    float glow = abs(sin(vPosition.x * 1.2 + uTime * 0.05)) * 0.04;
    
    vec3 finalColor = uColor * angleVariation * sunLight + uColor * glow;
    finalColor = clamp(finalColor, 0.0, 1.0);
    
    // STABILIZED: Strict alpha bounds
    float finalAlpha = clamp(uOpacity * angleVariation, 0.08, 0.82);
    
    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`;