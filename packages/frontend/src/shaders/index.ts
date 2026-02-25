/**
 * Shader Exports
 * Central export point for all GLSL shaders
 */

export * from './noise.glsl';
export * from './planet.shader';

// Atmospheric scattering - select specific exports to avoid naming conflicts
export {
  atmosphericConstants,
  phaseFunctions,
  atmosphericDepth,
  atmosphericScattering,
  atmosphereVertexShaderPhysical,
  atmosphereFragmentShaderPhysical,
  // Note: outerGlowFragmentShader is in planet.shader.ts
} from './atmospheric-scattering.glsl';

// Color grading utilities
export * from './color-grading.glsl';
