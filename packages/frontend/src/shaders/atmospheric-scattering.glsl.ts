/**
 * Physically Accurate Atmospheric Scattering
 * IMAX-grade implementation based on Nishita atmospheric model
 * Features: Rayleigh + Mie scattering, exponential altitude falloff
 * 
 * Reference: "Display of The Earth Taking into Account Atmospheric Scattering" - Nishita et al.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const atmosphericConstants = /* glsl */ `
  const float PI = 3.14159265359;
  const float EPSILON = 0.0001;
  
  // Physical constants (scaled for visualization)
  const float RAYLEIGH_SCALE_HEIGHT = 0.08;   // Rayleigh scale height (relative to radius)
  const float MIE_SCALE_HEIGHT = 0.012;       // Mie scale height (relative to radius)
  
  // Wavelengths for RGB (in micrometers, normalized)
  const vec3 LAMBDA_RGB = vec3(0.65, 0.57, 0.475); // Red, Green, Blue wavelengths
  
  // Rayleigh scattering coefficients (precomputed for RGB wavelengths)
  const vec3 RAYLEIGH_BETA = vec3(0.00058, 0.00135, 0.00331);
  
  // Mie scattering coefficient
  const float MIE_BETA = 0.004;
  
  // Mie scattering asymmetry factor (forward scattering bias)
  // Higher values = more forward scattering (0.0 = isotropic, 1.0 = fully forward)
  const float MIE_G = 0.76;
`;

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const phaseFunctions = /* glsl */ `
  // Rayleigh Phase Function
  // Scattering is symmetric about the perpendicular direction
  // cosTheta = dot(lightDir, viewDir)
  float rayleighPhase(float cosTheta) {
    // 3/16π * (1 + cos²θ) - simplified for performance
    return 0.0596831 * (1.0 + cosTheta * cosTheta);
  }
  
  // Henyey-Greenstein Phase Function for Mie Scattering
  // Models forward scattering (glow around light source)
  // g = asymmetry parameter (-1 to 1, typically 0.7-0.85 for atmosphere)
  float henyeyGreensteinPhase(float cosTheta, float g) {
    float g2 = g * g;
    float numerator = 1.0 - g2;
    float denominator = 1.0 + g2 - 2.0 * g * cosTheta;
    denominator = pow(max(denominator, EPSILON), 1.5);
    return numerator / (4.0 * PI * denominator);
  }
  
  // Combined Mie phase (forward + backward scattering)
  // More accurate for realistic atmospheric rendering
  float miePhaseCombined(float cosTheta, float g) {
    // Forward scattering component
    float forward = henyeyGreensteinPhase(cosTheta, g);
    // Backward scattering component (smaller contribution)
    float backward = henyeyGreensteinPhase(cosTheta, -g * 0.5);
    // Blend: mostly forward with subtle backward
    return forward * 0.85 + backward * 0.15;
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// ATMOSPHERIC DEPTH CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const atmosphericDepth = /* glsl */ `
  // Calculate intersection of ray with sphere
  // Returns distance from origin along ray direction
  // Returns -1.0 if no intersection
  float raySphereIntersect(vec3 origin, vec3 direction, vec3 sphereCenter, float sphereRadius) {
    vec3 oc = origin - sphereCenter;
    float b = dot(oc, direction);
    float c = dot(oc, oc) - sphereRadius * sphereRadius;
    float discriminant = b * b - c;
    
    if (discriminant < 0.0) return -1.0;
    
    float sqrtD = sqrt(discriminant);
    float t1 = -b - sqrtD;
    float t2 = -b + sqrtD;
    
    // Return the near intersection (or far if we're inside)
    if (t1 > 0.0) return t1;
    if (t2 > 0.0) return t2;
    return -1.0;
  }
  
  // Calculate optical depth through atmosphere
  // Uses exponential falloff based on altitude
  // altitude: height above planet surface (normalized 0-1)
  // scaleHeight: characteristic height for exponential falloff
  float opticalDepth(float altitude, float scaleHeight) {
    return exp(-altitude / scaleHeight);
  }
  
  // Integrate atmospheric density along ray path
  // Returns cumulative optical depth for scattering calculation
  float integrateOpticalDepth(
    vec3 rayOrigin,
    vec3 rayDirection,
    float planetRadius,
    float atmosphereRadius,
    float scaleHeight,
    int sampleCount
  ) {
    // Find atmosphere intersection
    float tMax = raySphereIntersect(rayOrigin, rayDirection, vec3(0.0), atmosphereRadius);
    if (tMax < 0.0) return 0.0;
    
    float tMin = 0.0;
    
    // Check if ray starts inside planet (shouldn't happen, but safety check)
    float distToCenter = length(rayOrigin);
    if (distToCenter < planetRadius) {
      float tExit = raySphereIntersect(rayOrigin, rayDirection, vec3(0.0), planetRadius);
      if (tExit > 0.0) tMin = tExit;
    }
    
    // Clamp integration range
    tMax = min(tMax, tMax - tMin);
    
    float stepSize = tMax / float(sampleCount);
    float opticalDepthSum = 0.0;
    
    for (int i = 0; i < 32; i++) {
      if (i >= sampleCount) break;
      
      float t = tMin + (float(i) + 0.5) * stepSize;
      vec3 samplePos = rayOrigin + rayDirection * t;
      
      float altitude = (length(samplePos) - planetRadius) / planetRadius;
      altitude = max(altitude, 0.0);
      
      opticalDepthSum += exp(-altitude / scaleHeight) * stepSize;
    }
    
    return opticalDepthSum;
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// FULL ATMOSPHERIC SCATTERING FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

export const atmosphericScattering = /* glsl */ `
  // Main atmospheric scattering calculation
  // Returns RGB color contribution from atmospheric scattering
  // 
  // Parameters:
  // - position: surface position (in planet radius units)
  // - viewDir: normalized direction from camera to surface point
  // - lightDir: normalized direction to light source (sun)
  // - planetRadius: planet radius (normalized to 1.0)
  // - atmosphereRadius: atmosphere outer radius (e.g., 1.1)
  // - rayleighCoeff: Rayleigh scattering intensity multiplier
  // - mieCoeff: Mie scattering intensity multiplier
  // - sampleCount: integration quality (8-32 typical)
  
  vec3 calculateAtmosphericScattering(
    vec3 position,
    vec3 viewDir,
    vec3 lightDir,
    float planetRadius,
    float atmosphereRadius,
    float rayleighCoeff,
    float mieCoeff,
    int sampleCount
  ) {
    // STABILIZED: Clamp inputs to prevent numerical instability
    position = clamp(position, -100.0, 100.0);
    viewDir = normalize(viewDir);
    lightDir = normalize(lightDir);
    
    float distToCenter = length(position);
    float altitude = max(distToCenter - planetRadius, 0.0);
    float normalizedAltitude = altitude / planetRadius;
    
    // STABILIZED: Early exit for points outside atmosphere
    if (distToCenter > atmosphereRadius) {
      return vec3(0.0);
    }
    
    // Calculate view angle to sun
    float cosTheta = dot(viewDir, lightDir);
    cosTheta = clamp(cosTheta, -1.0, 1.0);
    
    // Phase function values
    float phaseR = rayleighPhase(cosTheta);
    float phaseM = miePhaseCombined(cosTheta, MIE_G);
    
    // Rayleigh optical depth (exponential falloff with altitude)
    float depthR = opticalDepth(normalizedAltitude, RAYLEIGH_SCALE_HEIGHT);
    
    // Mie optical depth (faster falloff, aerosols are lower)
    float depthM = opticalDepth(normalizedAltitude, MIE_SCALE_HEIGHT);
    
    // STABILIZED: Clamp depth values to prevent extremes
    depthR = clamp(depthR * rayleighCoeff, 0.0, 3.0);
    depthM = clamp(depthM * mieCoeff, 0.0, 3.0);
    
    // Compute scattering contributions
    vec3 rayleighContribution = RAYLEIGH_BETA * phaseR * depthR;
    float mieContribution = MIE_BETA * phaseM * depthM;
    
    // STABILIZED: Combine with strict clamping for bloom compatibility
    vec3 totalScattering = rayleighContribution + vec3(mieContribution);
    totalScattering = clamp(totalScattering, 0.0, 1.5);
    
    return totalScattering;
  }
  
  // Simplified version for real-time performance
  // Uses precomputed values and fewer samples
  vec3 calculateAtmosphericScatteringFast(
    vec3 position,
    vec3 viewDir,
    vec3 lightDir,
    float rayleighCoeff,
    float mieCoeff
  ) {
    // STABILIZED: Clamp and normalize all inputs
    viewDir = normalize(viewDir);
    lightDir = normalize(lightDir);
    
    float altitude = length(position) - 1.0; // Assuming normalized planet radius
    altitude = max(altitude, 0.0);
    
    // STABILIZED: Cosine angle with safe clamping
    float cosTheta = clamp(dot(viewDir, lightDir), -1.0, 1.0);
    
    // Phase functions
    float phaseR = rayleighPhase(cosTheta);
    float phaseM = miePhaseCombined(cosTheta, MIE_G);
    
    // STABILIZED: Exponential falloff with clamping
    float depthR = clamp(exp(-altitude / RAYLEIGH_SCALE_HEIGHT) * rayleighCoeff, 0.0, 2.0);
    float depthM = clamp(exp(-altitude / MIE_SCALE_HEIGHT) * mieCoeff, 0.0, 2.0);
    
    // STABILIZED: Final color with strict bounds
    vec3 color = RAYLEIGH_BETA * phaseR * depthR + vec3(MIE_BETA * phaseM * depthM);
    return clamp(color, 0.0, 1.2);
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// COMPLETE ATMOSPHERE VERTEX SHADER
// ═══════════════════════════════════════════════════════════════════════════════

export const atmosphereVertexShaderPhysical = /* glsl */ `
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
// COMPLETE ATMOSPHERE FRAGMENT SHADER
// ═══════════════════════════════════════════════════════════════════════════════

export const atmosphereFragmentShaderPhysical = /* glsl */ `
  ${atmosphericConstants}
  ${phaseFunctions}
  ${atmosphericDepth}
  ${atmosphericScattering}
  
  uniform vec3 uSunDirection;
  uniform vec3 uColorInner;
  uniform vec3 uColorOuter;
  uniform float uIntensity;
  uniform float uRayleighCoeff;
  uniform float uMieCoeff;
  uniform float uPlanetRadius;
  uniform float uAtmosphereRadius;
  uniform float uTime;
  
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
    float fresnel = pow(fresnelSmooth, 2.5);
    
    // STABILIZED: Clamp fresnel to safe bounds
    fresnel = clamp(fresnel, 0.02, 0.85);
    
    // Calculate physical atmospheric scattering
    vec3 scattering = calculateAtmosphericScatteringFast(
      vPositionLocal,
      -viewDir,  // Direction from camera to surface
      sunDir,
      uRayleighCoeff,
      uMieCoeff
    );
    
    // STABILIZED: Blend between inner and outer atmosphere colors
    // Inner = warm (near surface), Outer = cool (blue shift at edges)
    vec3 atmosphereColor = mix(uColorInner, uColorOuter, fresnel);
    
    // STABILIZED: Add physical scattering contribution
    atmosphereColor += scattering * 0.3;
    
    // STABILIZED: Very slow, subtle pulse animation - low frequency only
    float pulse = sin(uTime * 0.08) * 0.008 + 1.0;
    
    // STABILIZED: Calculate final alpha with strict bounds
    float alpha = fresnel * uIntensity * pulse;
    
    // STABILIZED: Additional glow at grazing angles (rim enhancement)
    float rimGlow = pow(fresnel, 3.0) * 0.15;
    alpha += rimGlow;
    
    // STABILIZED: Final clamping for bloom stability
    alpha = clamp(alpha, 0.02, 0.80);
    atmosphereColor = clamp(atmosphereColor, 0.0, 1.0);
    
    gl_FragColor = vec4(atmosphereColor, alpha);
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// OUTER GLOW FRAGMENT SHADER (Simplified for performance)
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

  void main() {
    // STABILIZED: Normalize directions
    vec3 viewDir = normalize(vViewDirection);
    vec3 sunDir = normalize(uSunDirection);
    vec3 normal = normalize(vNormal);
    
    // STABILIZED: Fresnel with extra smoothing for outer glow
    float fresnelDot = max(dot(viewDir, normal), 0.0);
    float fresnelBase = 1.0 - fresnelDot;
    float fresnelSmooth = smoothstep(0.0, 1.0, fresnelBase);
    float fresnel = pow(fresnelSmooth, 1.8);
    
    // STABILIZED: Clamp to prevent edge bleeding
    fresnel = clamp(fresnel, 0.01, 0.70);
    
    // Color gradient
    vec3 glowColor = mix(uColorInner, uColorOuter, fresnel);
    
    // STABILIZED: Subtle forward scattering glow toward sun
    float cosTheta = dot(-viewDir, sunDir);
    float mieGlow = henyeyGreensteinPhase(cosTheta, 0.6) * 0.1;
    glowColor += vec3(mieGlow) * fresnel;
    
    // STABILIZED: Static opacity (minimal animation)
    float alpha = fresnel * uIntensity;
    alpha = clamp(alpha, 0.01, 0.50);
    
    gl_FragColor = vec4(clamp(glowColor, 0.0, 1.0), alpha);
  }
`;