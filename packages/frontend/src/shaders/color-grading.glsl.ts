/**
 * IMAX HDR Color Grading Pipeline
 * NASA-grade cinematic color grading with ACES tone mapping
 * Features: Natural cinematic grade, soft contrast, balanced saturation
 * 
 * COLOR DIRECTION:
 * - Cool shadows (subtle teal shift)
 * - Warm highlights (sun-like warmth)
 * - Reduced saturation (natural look)
 * - Soft contrast curve (film-like)
 * 
 * NO:
 * - Neon cyan/purple glow
 * - Hyper-saturated crypto colors
 * - Artificial color bleeding
 */

// ═══════════════════════════════════════════════════════════════════════════════
// COLOR SPACE UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

export const colorSpaceUtils = /* glsl */ `
  // sRGB to Linear conversion (precision optimized)
  vec3 srgbToLinear(vec3 srgb) {
    return pow(max(srgb, vec3(0.0)), vec3(2.2));
  }
  
  // Linear to sRGB conversion (precision optimized)
  vec3 linearToSrgb(vec3 linear) {
    linear = max(linear, vec3(0.0));
    return pow(linear, vec3(1.0 / 2.2));
  }
  
  // ACES color space conversion (simplified)
  // Input: Linear Rec.709
  // Output: ACEScg
  vec3 rec709ToAcescg(vec3 color) {
    const mat3 MATRIX = mat3(
      0.6131, 0.0701, 0.0206,
      0.3395, 0.9164, 0.1097,
      0.0474, 0.0135, 0.8697
    );
    return MATRIX * max(color, vec3(0.0));
  }
  
  // ACEScg to Rec.709
  vec3 acescgToRec709(vec3 color) {
    const mat3 MATRIX = mat3(
      1.6310, -0.1217, -0.0109,
      -0.8330, 1.1223, -0.1152,
      0.2020, -0.0006, 1.1261
    );
    return MATRIX * max(color, vec3(0.0));
  }
  
  // Luminance calculation (Rec.709 coefficients)
  float luminance(vec3 color) {
    return dot(color, vec3(0.2126, 0.7152, 0.0722));
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// TONE MAPPING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const toneMapping = /* glsl */ `
  // ACES Filmic Tone Mapping (approximation)
  // Provides cinematic highlight rolloff
  vec3 acesFilmic(vec3 x) {
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
  }
  
  // Reinhard Tone Mapping (alternative)
  vec3 reinhard(vec3 x) {
    return x / (x + vec3(1.0));
  }
  
  // Filmic Tone Mapping (Uncharted 2 approximation)
  vec3 filmicToneMap(vec3 x) {
    vec3 X = max(vec3(0.0), x - 0.004);
    return (X * (6.2 * X + 0.5)) / (X * (6.2 * X + 1.7) + 0.06);
  }
  
  // Soft contrast curve
  // Prevents harsh contrast while maintaining detail
  float softContrast(float x, float contrast, float midpoint) {
    // Sigmoid contrast function
    float s = contrast * 0.5;
    float a = midpoint;
    return a + (x - a) / (1.0 + s * abs(x - a));
  }
  
  vec3 softContrast3(vec3 color, float contrast, float midpoint) {
    return vec3(
      softContrast(color.r, contrast, midpoint),
      softContrast(color.g, contrast, midpoint),
      softContrast(color.b, contrast, midpoint)
    );
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// CINEMATIC COLOR GRADING
// ═══════════════════════════════════════════════════════════════════════════════

export const cinematicColorGrading = /* glsl */ `
  // LUT-based color grading (procedural approximation)
  // Teal shadows / warm highlights for cinematic look
  vec3 cinematicGrade(
    vec3 color,
    vec3 shadowColor,
    vec3 highlightColor,
    float shadowIntensity,
    float highlightIntensity
  ) {
    // Calculate luminance
    float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
    
    // STABILIZED: Clamp luminance
    luminance = clamp(luminance, 0.0, 1.0);
    
    // Shadow tint (affects dark areas more)
    float shadowMask = 1.0 - smoothstep(0.0, 0.4, luminance);
    shadowMask *= shadowIntensity;
    
    // Highlight tint (affects bright areas more)
    float highlightMask = smoothstep(0.6, 1.0, luminance);
    highlightMask *= highlightIntensity;
    
    // Apply tints with smooth blending
    vec3 graded = color;
    graded = mix(graded, graded * shadowColor, shadowMask);
    graded = mix(graded, graded * highlightColor, highlightMask);
    
    return graded;
  }
  
  // Split toning (teal/orange cinematic look)
  vec3 splitToning(vec3 color, float balance, vec3 darkColor, vec3 lightColor) {
    float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
    luminance = clamp(luminance, 0.0, 1.0);
    
    // Adjust based on balance (-1 to 1)
    float luma = luminance + balance * 0.5;
    luma = clamp(luma, 0.0, 1.0);
    
    // Smooth split
    float darkWeight = 1.0 - smoothstep(0.2, 0.5, luma);
    float lightWeight = smoothstep(0.5, 0.8, luma);
    
    vec3 result = color;
    result = mix(result, result * darkColor, darkWeight * 0.25);
    result = mix(result, result * lightColor, lightWeight * 0.2);
    
    return result;
  }
  
  // Teal-Orange cinematic look (blockbuster style)
  vec3 tealOrangeGrade(vec3 color, float intensity) {
    // Teal for shadows
    vec3 tealTint = vec3(0.85, 0.95, 1.05);
    // Orange for highlights  
    vec3 orangeTint = vec3(1.08, 0.95, 0.88);
    
    return splitToning(color, 0.0, tealTint, orangeTint) * mix(1.0, 1.0, intensity);
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// VIGNETTE EFFECT
// ═══════════════════════════════════════════════════════════════════════════════

export const vignetteEffect = /* glsl */ `
  // Screen-space vignette
  // uv: normalized screen coordinates (0-1)
  // intensity: vignette strength (0-1)
  // smoothness: edge softness (0-1)
  float vignette(vec2 uv, float intensity, float smoothness, vec2 center) {
    vec2 uvCenter = center;
    vec2 uvDelta = uv - uvCenter;
    
    // Distance from center
    float dist = length(uvDelta);
    
    // STABILIZED: Smooth vignette falloff
    float vignetteFactor = 1.0 - smoothstep(0.4, 0.4 + smoothness * 0.6, dist);
    vignetteFactor = mix(1.0, vignetteFactor, intensity);
    
    return clamp(vignetteFactor, 0.0, 1.0);
  }
  
  // Default vignette (centered)
  float vignette(vec2 uv, float intensity) {
    return vignette(uv, intensity, 0.5, vec2(0.5));
  }
  
  // Elliptical vignette for widescreen
  float vignetteWidescreen(vec2 uv, float intensity, float aspectRatio) {
    vec2 uvCenter = vec2(0.5);
    vec2 uvDelta = uv - uvCenter;
    uvDelta.x *= aspectRatio;
    
    float dist = length(uvDelta);
    return 1.0 - smoothstep(0.3, 0.7, dist) * intensity;
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// COMPLETE COLOR GRADING PIPELINE
// ═══════════════════════════════════════════════════════════════════════════════

export const colorGradingPipeline = /* glsl */ `
  ${colorSpaceUtils}
  ${toneMapping}
  ${cinematicColorGrading}
  ${vignetteEffect}
  
  // Full color grading pipeline
  // Apply in order: HDR clamping -> Tone mapping -> Color grade -> Gamma correction
  vec3 applyColorGrading(
    vec3 hdrColor,
    float exposure,
    float contrast,
    float saturation,
    vec3 shadowTint,
    vec3 highlightTint,
    float shadowIntensity,
    float highlightIntensity,
    vec2 screenUv,
    float vignetteIntensity
  ) {
    // STABILIZED: HDR input clamping (prevent extreme values)
    hdrColor = clamp(hdrColor, 0.0, 10.0);
    
    // Step 1: Exposure adjustment
    vec3 exposed = hdrColor * exposure;
    
    // Step 2: ACES Filmic Tone Mapping
    vec3 toneMapped = acesFilmic(exposed);
    
    // Step 3: Soft contrast (preserve midtones)
    vec3 contrasted = softContrast3(toneMapped, contrast, 0.5);
    
    // Step 4: Saturation adjustment
    float luma = dot(contrasted, vec3(0.2126, 0.7152, 0.0722));
    vec3 saturated = mix(vec3(luma), contrasted, saturation);
    
    // Step 5: Cinematic color grade (teal shadows / warm highlights)
    vec3 graded = cinematicGrade(
      saturated,
      shadowTint,
      highlightTint,
      shadowIntensity,
      highlightIntensity
    );
    
    // Step 6: Apply vignette
    float vig = vignette(screenUv, vignetteIntensity);
    graded *= vig;
    
    // Step 7: Final clamping
    graded = clamp(graded, 0.0, 1.0);
    
    return graded;
  }
  
  // Simplified pipeline for real-time use
  vec3 applyColorGradingSimple(vec3 hdrColor, float exposure) {
    // STABILIZED: HDR input clamping
    hdrColor = clamp(hdrColor, 0.0, 4.0);
    
    // Exposure + ACES Tone Mapping
    vec3 result = acesFilmic(hdrColor * exposure);
    
    // Teal-Orange cinematic look (subtle)
    result = tealOrangeGrade(result, 0.15);
    
    // Final clamp
    return clamp(result, 0.0, 1.0);
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// PRESET COLOR GRADES
// ═══════════════════════════════════════════════════════════════════════════════

export const colorGradePresets = /* glsl */ `
  // Cinematic sci-fi preset
  vec3 gradeCinematicSciFi(vec3 color, vec2 uv) {
    vec3 shadowTint = vec3(0.85, 0.92, 1.05);   // Cool teal shadows
    vec3 highlightTint = vec3(1.05, 0.95, 0.88); // Warm highlights
    
    return applyColorGrading(
      color,
      1.05,   // exposure
      0.15,   // contrast
      1.05,   // saturation
      shadowTint,
      highlightTint,
      0.25,   // shadow intensity
      0.20,   // highlight intensity
      uv,
      0.15    // vignette intensity
    );
  }
  
  // Warm cinematic preset
  vec3 gradeCinematicWarm(vec3 color, vec2 uv) {
    vec3 shadowTint = vec3(0.92, 0.88, 0.85);   // Warm shadows
    vec3 highlightTint = vec3(1.08, 1.02, 0.95); // Golden highlights
    
    return applyColorGrading(
      color,
      1.0,    // exposure
      0.12,   // contrast
      1.0,    // saturation
      shadowTint,
      highlightTint,
      0.20,   // shadow intensity
      0.25,   // highlight intensity
      uv,
      0.12    // vignette intensity
    );
  }
  
  // Planet surface grade (enhanced warmth for Mars-like appearance)
  vec3 gradePlanetSurface(vec3 color) {
    // STABILIZED: Input clamping
    color = clamp(color, 0.0, 2.0);
    
    // Apply ACES tone mapping
    vec3 result = acesFilmic(color * 1.08);
    
    // Warm color shift for planet
    result.r *= 1.02;
    result.g *= 0.98;
    result.b *= 0.95;
    
    // Slight contrast boost
    result = softContrast3(result, 0.1, 0.5);
    
    return clamp(result, 0.0, 1.0);
  }
`;