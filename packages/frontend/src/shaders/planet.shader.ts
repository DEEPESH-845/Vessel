/**
 * Planet Shader System - NASA Grade
 * Custom GLSL shaders for physically accurate planetary rendering
 * Features: Microfacet BRDF, Fresnel reflections, HDR color grading
 * 
 * PHYSICAL ACCURACY:
 * - Cook-Torrance microfacet specular BRDF
 * - GGX/Trowbridge-Reitz normal distribution
 * - Smith geometry function for shadowing/masking
 * - Schlick's Fresnel approximation
 * - Lambertian diffuse with energy conservation
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
// PHYSICALLY BASED SHADING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const pbrFunctions = /* glsl */ `
  const float PI = 3.14159265359;
  const float EPSILON = 0.0001;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GGX/TROWBRIDGE-REITZ NORMAL DISTRIBUTION FUNCTION
  // Determines the statistical distribution of microfacet normals
  // α = roughness² (Disney remapping for perceptual linearity)
  // ═══════════════════════════════════════════════════════════════════════════
  float distributionGGX(vec3 N, vec3 H, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH * NdotH;
    
    float numerator = a2;
    float denominator = (NdotH2 * (a2 - 1.0) + 1.0);
    denominator = PI * denominator * denominator;
    
    return numerator / max(denominator, EPSILON);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SMITH GEOMETRY FUNCTION
  // Accounts for microfacet shadowing and masking
  // Uses Schlick-GGX approximation with height-correlated visibility
  // ═══════════════════════════════════════════════════════════════════════════
  float geometrySchlickGGX(float NdotV, float roughness) {
    float r = roughness + 1.0;
    float k = (r * r) / 8.0; // Disney remapping for IBL
    
    float numerator = NdotV;
    float denominator = NdotV * (1.0 - k) + k;
    
    return numerator / max(denominator, EPSILON);
  }
  
  float geometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2 = geometrySchlickGGX(NdotV, roughness);
    float ggx1 = geometrySchlickGGX(NdotL, roughness);
    
    return ggx1 * ggx2;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // FRESNEL EQUATION (SCHLICK APPROXIMATION)
  // F(θ) = F0 + (1 - F0)(1 - cosθ)⁵
  // F0 = base reflectivity at normal incidence
  // For dielectrics: F0 ≈ 0.04 (4% reflectivity)
  // For conductors: F0 is tinted by the metal's color
  // ═══════════════════════════════════════════════════════════════════════════
  vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
  }
  
  // Fresnel with roughness for IBL (Roughness-aware Fresnel)
  vec3 fresnelSchlickRoughness(float cosTheta, vec3 F0, float roughness) {
    return F0 + (max(vec3(1.0 - roughness), F0) - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // COOK-TORRANCE MICROFACET BRDF
  // f(L,V) = DFG / (4·(N·L)·(N·V))
  // Combined with Lambertian diffuse: f_diffuse = albedo / π
  // Energy conservation: kd = 1 - metallic (metals have no diffuse)
  // ═══════════════════════════════════════════════════════════════════════════
  vec3 calculatePBR(
    vec3 N,           // Surface normal
    vec3 V,           // View direction
    vec3 L,           // Light direction
    vec3 albedo,      // Base color
    float metallic,   // Metalness (0=dielectric, 1=conductor)
    float roughness,  // Perceptual roughness (0=smooth, 1=rough)
    vec3 radiance     // Incoming light radiance
  ) {
    vec3 H = normalize(V + L); // Halfway vector
    
    // Base reflectivity (F0)
    // For dielectrics: ~0.04, for metals: albedo-tinted
    vec3 F0 = vec3(0.04);
    F0 = mix(F0, albedo, metallic);
    
    // Cook-Torrance BRDF
    float NDF = distributionGGX(N, H, roughness);
    float G = geometrySmith(N, V, L, roughness);
    vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);
    
    vec3 numerator = NDF * G * F;
    float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + EPSILON;
    vec3 specular = numerator / denominator;
    
    // Energy conservation
    vec3 kS = F;                           // Specular reflection fraction
    vec3 kD = vec3(1.0) - kS;             // Diffuse fraction
    kD *= 1.0 - metallic;                  // Metals have no diffuse
    
    // Diffuse (Lambertian)
    float NdotL = max(dot(N, L), 0.0);
    vec3 diffuse = kD * albedo / PI;
    
    // Final radiance contribution
    return (diffuse + specular) * radiance * NdotL;
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// PLANET VERTEX SHADER (STABILIZED)
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
  varying vec3 vViewPosition;

  void main() {
    vUv = uv;
    
    // Multi-octave noise displacement for surface detail
    // STABILIZED: Very slow time multipliers for stability (0.01-0.02)
    float noise1 = snoise(position * 1.5 + uTime * 0.008);
    float noise2 = snoise(position * 3.0 + uTime * 0.012) * 0.5;
    float noise3 = snoise(position * 6.0 + uTime * 0.016) * 0.25;
    
    // Combine noise layers
    float totalNoise = noise1 + noise2 + noise3;
    
    // STABILIZED: Breathing motion - very subtle, low frequency
    float breathing = sin(uTime * 0.08) * 0.004 + 1.0;
    
    // STABILIZED: Calculate displacement with strict clamp (reduced amplitude)
    float displacement = clamp(totalNoise * uDisplacementScale * breathing, -0.04, 0.04);
    vDisplacement = displacement;
    
    // Apply displacement along normal
    vec3 newPosition = position + normal * displacement;
    
    // STABILIZED: Very slow wave distortion - minimal amplitude
    float wave = sin(position.y * 3.0 + uTime * uWaveSpeed * 0.15) * 0.003;
    newPosition += normal * wave;
    
    // Calculate displaced normal for proper lighting
    // Approximate using finite differences
    float eps = 0.001;
    float dx = snoise(position + vec3(eps, 0.0, 0.0)) - snoise(position - vec3(eps, 0.0, 0.0));
    float dy = snoise(position + vec3(0.0, eps, 0.0)) - snoise(position - vec3(0.0, eps, 0.0));
    float dz = snoise(position + vec3(0.0, 0.0, eps)) - snoise(position - vec3(0.0, 0.0, eps));
    vec3 noiseGrad = vec3(dx, dy, dz) / (2.0 * eps);
    
    vNormal = normalize(normalMatrix * (normal - noiseGrad * uDisplacementScale * 0.5));
    vPosition = newPosition;
    
    vec4 worldPosition = modelMatrix * vec4(newPosition, 1.0);
    vWorldPosition = worldPosition.xyz;
    
    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
    vViewPosition = -mvPosition.xyz;
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// PLANET FRAGMENT SHADER (PHYSICALLY BASED)
// ═══════════════════════════════════════════════════════════════════════════════

export const planetFragmentShader = /* glsl */ `
  ${simplexNoise3D}
  ${pbrFunctions}
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
  varying vec3 vViewPosition;

  void main() {
    // ═══════════════════════════════════════════════════════════════════════════
    // GEOMETRY SETUP
    // ═══════════════════════════════════════════════════════════════════════════
    vec3 V = normalize(vViewPosition);        // View direction (camera space)
    vec3 N = normalize(vNormal);              // Surface normal
    vec3 L = normalize(uSunDirection);        // Light direction (sun)
    
    // ═══════════════════════════════════════════════════════════════════════════
    // SURFACE PROPERTIES
    // ═══════════════════════════════════════════════════════════════════════════
    
    // Animated surface noise - very slow and subtle
    float surfaceNoise = snoise(vPosition * 1.2 + uTime * 0.006) * 0.5 + 0.5;
    float detailNoise = snoise(vPosition * 3.5 + uTime * 0.01) * 0.08;
    
    // Height-based color gradient
    float gradientY = clamp((vPosition.y + 2.0) / 4.0, 0.0, 1.0);
    vec3 albedo = mix(uColorPrimary, uColorSecondary, gradientY);
    
    // Add noise variation to albedo - very subtle
    albedo = mix(albedo, uColorSecondary, surfaceNoise * 0.10 + detailNoise * 0.05);
    
    // Displacement-based color variation (craters appear darker)
    float depthFactor = smoothstep(-0.05, 0.05, vDisplacement);
    albedo = mix(albedo * 0.85, albedo, depthFactor);
    
    // ═══════════════════════════════════════════════════════════════════════════
    // MATERIAL PROPERTIES (PLANETARY SURFACE)
    // ═══════════════════════════════════════════════════════════════════════════
    
    // Roughness: 0.7-0.85 for matte planetary surface (no plastic shine)
    float baseRoughness = 0.75;
    // Add slight variation based on surface noise
    float roughness = baseRoughness + surfaceNoise * 0.08;
    roughness = clamp(roughness, 0.65, 0.88);
    
    // Metallic: 0.0 for rocky planets (dielectric surface)
    // No metallic reflectivity for natural planetary surfaces
    float metallic = 0.0;
    
    // ═══════════════════════════════════════════════════════════════════════════
    // LIGHTING - PHYSICALLY BASED RENDERING
    // ═══════════════════════════════════════════════════════════════════════════
    
    // Main sun light
    vec3 sunRadiance = vec3(2.5);  // HDR sun intensity
    vec3 directLight = calculatePBR(N, V, L, albedo, metallic, roughness, sunRadiance);
    
    // Ambient light (very dim fill from space)
    vec3 ambientRadiance = vec3(0.08);
    vec3 ambientLight = albedo * ambientRadiance;
    
    // ═══════════════════════════════════════════════════════════════════════════
    // FRESNEL RIM LIGHTING (ATMOSPHERIC GLOW EFFECT)
    // ═══════════════════════════════════════════════════════════════════════════
    
    // Calculate Fresnel for rim effect
    float NdotV = max(dot(N, V), 0.0);
    float fresnelBase = 1.0 - NdotV;
    
    // STABILIZED: smoothstep before power for edge stability
    float fresnelSmooth = smoothstep(0.0, 1.0, fresnelBase);
    float fresnel = pow(fresnelSmooth, uRimPower);
    fresnel = clamp(fresnel, 0.0, 0.7);
    
    // Rim color with controlled intensity (subtle atmospheric glow)
    vec3 rimColor = uColorAccent * fresnel * uRimIntensity * 0.35;
    
    // ═══════════════════════════════════════════════════════════════════════════
    // SUBSURFACE SCATTERING (THIN ATMOSPHERE GLOW)
    // ═══════════════════════════════════════════════════════════════════════════
    
    // Subtle SSS for thin atmospheric effect at terminator
    float sss = pow(max(dot(V, -L), 0.0), 3.0) * max(dot(N, L), 0.0) * 0.08;
    vec3 sssColor = uColorSecondary * sss;
    
    // ═══════════════════════════════════════════════════════════════════════════
    // COMBINE ALL LIGHTING
    // ═══════════════════════════════════════════════════════════════════════════
    
    vec3 finalColor = directLight + ambientLight + rimColor + sssColor;
    
    // ═══════════════════════════════════════════════════════════════════════════
    // HDR COLOR GRADING (CINEMATIC)
    // ═══════════════════════════════════════════════════════════════════════════
    
    finalColor = gradePlanetSurface(finalColor);
    
    // ═══════════════════════════════════════════════════════════════════════════
    // BRIGHTNESS CONSTRAINTS (NO PURE WHITE, NO CRUSHED BLACKS)
    // ═══════════════════════════════════════════════════════════════════════════
    
    // Highlight clamp: max 0.88 (no pure white)
    // Shadow floor: min 0.06 (no crushed blacks)
    // This creates a more cinematic, film-like tonal range
    finalColor = clamp(finalColor, 0.06, 0.88);
    
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
  uniform float uPlanetRadius;
  
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
      uPlanetRadius,
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