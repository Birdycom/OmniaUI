// File: packages/ui/src/particles.d.ts
// Types for the particle field script (canvas.oc-particles).

export interface ParticleOptions {
  /** Number of points (110). */
  count?: number;
  /** Speed of the drift (0.35). */
  speed?: number;
  /** Distance in px under which two points get a line (115). */
  link?: number;
}
export function particleOptions(canvas: HTMLCanvasElement): Required<ParticleOptions>;
export function initParticles(canvas: HTMLCanvasElement, options?: ParticleOptions): () => void;
export function initParticleFields(scope?: ParentNode): () => void;
