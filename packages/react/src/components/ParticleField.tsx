// Same markup as packages/ui/snippets/particle-field.html; the drawing is packages/ui/src/particles.js.
"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { CanvasHTMLAttributes } from "react";
import { initParticles } from "../../../ui/src/particles.js";
import { cx } from "../utils";

export interface ParticleFieldProps extends CanvasHTMLAttributes<HTMLCanvasElement> {
  /** Number of points (110). */
  count?: number;
  /** Speed of the drift (0.35). */
  speed?: number;
  /** Distance in px under which two points get a line (115). */
  link?: number;
  /** Fill the positioned parent instead of the viewport. */
  local?: boolean;
}

/** Background canvas with drifting points and lines (`canvas.oc-particles`); one still frame with reduced motion. */
export const ParticleField = forwardRef<HTMLCanvasElement, ParticleFieldProps>(function ParticleField(
  { count, speed, link, local, className, ...rest },
  ref,
) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useImperativeHandle(ref, () => canvas.current as HTMLCanvasElement);
  useEffect(() => {
    if (!canvas.current) return;
    const options = Object.fromEntries(Object.entries({ count, speed, link }).filter(([, v]) => v != null));
    return initParticles(canvas.current, options);
  }, [count, speed, link]);
  return <canvas ref={canvas} aria-hidden="true" className={cx("oc-particles", local && "oc-particles--local", className)} {...rest} />;
});
