// File: packages/react/src/components/LiveFrame.tsx | Map: types -> LiveFrame (div.oc-live-frame + virtual size -> iframe and/or children)
import { forwardRef } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode, Ref, SyntheticEvent } from "react";
import { cx } from "../utils";

export interface LiveFrameProps extends HTMLAttributes<HTMLDivElement> {
  /** Page to show in an iframe. Leave empty and pass children (an <img>, <video>, or .oc-live-frame__content). With
   *  both, the children come after the iframe (a watermark or a badge on top of the page). */
  src?: string;
  /** Accessible name of the iframe. */
  title?: string;
  /** Virtual size in px: the page is laid out at this size and scaled to the frame width. */
  width?: number;
  height?: number;
  /** A picture of a page: clicks and scrolling pass through. */
  static?: boolean;
  /** Put the frame in the view slot of an OmniaUI browser frame (adds .oc-browser-frame__view). */
  inBrowserFrame?: boolean;
  /** Only to look at: the iframe gets `inert` (no focus, no clicks, hidden from screen readers). */
  inert?: boolean;
  /** A phone, television or laptop bezel around the page (the laptop with a base). Phone defaults to 390 x 844, tv to
   *  1280 x 720, laptop to 1440 x 900. */
  device?: "phone" | "tv" | "laptop";
  /** Ref to the iframe (for postMessage). */
  frameRef?: Ref<HTMLIFrameElement>;
  /** The iframe has loaded. */
  onFrameLoad?: (event: SyntheticEvent<HTMLIFrameElement>) => void;
  children?: ReactNode;
}

/** `.oc-live-frame`: a live page at a virtual size, scaled down to the frame width in pure CSS. */
export const LiveFrame = forwardRef<HTMLDivElement, LiveFrameProps>(function LiveFrame(
  { src, title = "", width, height, static: isStatic = false, inBrowserFrame = false, inert = false, device, frameRef, onFrameLoad, className, style, children, ...rest },
  ref,
) {
  const w = width ?? (device === "phone" ? 390 : device === "laptop" ? 1440 : 1280);
  const h = height ?? (device === "phone" ? 844 : device === "laptop" ? 900 : 720);
  const size = { "--oc-live-w": w, "--oc-live-h": h } as CSSProperties;
  return (
    <div
      ref={ref}
      className={cx(inBrowserFrame && "oc-browser-frame__view", "oc-live-frame", isStatic && "oc-live-frame--static", device && `oc-live-frame--${device}`, className)}
      style={{ ...size, ...style }}
      {...rest}
    >
      {src ? <iframe ref={frameRef} src={src} title={title} loading="lazy" scrolling="no" tabIndex={isStatic || inert ? -1 : undefined} inert={inert || undefined} aria-hidden={inert || undefined} onLoad={onFrameLoad} /> : null}
      {children}
    </div>
  );
});
