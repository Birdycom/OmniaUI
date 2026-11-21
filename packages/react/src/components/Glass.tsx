// File: packages/react/src/components/Glass.tsx | Map: types -> useGlassLens (glass-lens.js after mount) -> useGlassDrag (optional drag) -> Glass (sheet: --strong, --flat, --liquid, lens, draggable) -> GlassPanel (layer: --strong)
import { forwardRef, useEffect, useRef } from "react";
import type { HTMLAttributes, RefObject } from "react";
import { bindGlassDrag, bindGlassLens } from "../../../ui/src/glass-lens.js";
import { useMergedRef } from "../hooks";
import { cx } from "../utils";

/** Gives the element the glass lens after mount (Chromium; elsewhere frosted glass) and removes it on unmount. */
export function useGlassLens(ref: RefObject<HTMLElement | null>, on = true, deps: unknown[] = []) {
  useEffect(() => {
    const el = ref.current;
    if (!on || !el) return;
    return bindGlassLens(el);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, ...deps]);
}


/** Makes the element draggable over its backdrop (mouse, touch, arrow keys; clamped to its parent) while `on`. */
export function useGlassDrag(ref: RefObject<HTMLElement | null>, on = true) {
  useEffect(() => {
    const el = ref.current;
    if (!on || !el) return;
    return bindGlassDrag(el);
  }, [on]);
}

export interface GlassProps extends Omit<HTMLAttributes<HTMLElement>, "draggable"> {
  /** More opaque, for text-heavy content. */
  strong?: boolean;
  /** Desktop window where the OS draws the blur: no own blur, no drop shadow. */
  flat?: boolean;
  /** Liquid glass: clear tint, strong blur and saturation, specular rim. */
  liquid?: boolean;
  /** The lens: in Chromium the backdrop bends at the edge (glass-lens.js); elsewhere frosted glass. Default true. */
  lens?: boolean;
  /** People can move the sheet over its backdrop: mouse, touch, arrow keys (Shift: further), Home back; it stays
   *  inside its parent (or the closest [data-oc-glass-drag-area]). Not the native HTML drag-and-drop attribute. */
  draggable?: boolean;
  as?: "div" | "section" | "aside" | "article" | "main";
}

/** `.oc-glass`: see-through sheet with a light top edge; .oc-card inside becomes a glass panel. */
export const Glass = forwardRef<HTMLElement, GlassProps>(function Glass(
  { strong, flat, liquid, lens = true, draggable = false, as: Tag = "div", className, ...rest },
  forwardedRef,
) {
  const inner = useRef<HTMLElement>(null);
  const ref = useMergedRef(inner, forwardedRef);
  useGlassLens(inner, lens && !flat, [className]);
  useGlassDrag(inner, draggable);
  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={cx("oc-glass", strong && "oc-glass--strong", flat && "oc-glass--flat", liquid && "oc-glass--liquid", className)}
      data-oc-glass-lens={lens ? undefined : "off"}
      data-oc-glass-drag={draggable ? "" : undefined}
      {...rest}
    />
  );
});

export interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  strong?: boolean;
}

/** `.oc-glass-panel`: a lighter layer inside a glass sheet. */
export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(function GlassPanel({ strong, className, ...rest }, ref) {
  return <div ref={ref} className={cx("oc-glass-panel", strong && "oc-glass-panel--strong", className)} {...rest} />;
});
