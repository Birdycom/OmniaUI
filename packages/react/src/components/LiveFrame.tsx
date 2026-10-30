// File: packages/react/src/components/LiveFrame.tsx | Map: types -> LiveFrame (div.oc-live-frame + virtual size -> iframe or children)
import { forwardRef } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface LiveFrameProps extends HTMLAttributes<HTMLDivElement> {
  /** Page to show in an iframe. Leave empty and pass children (an <img>, <video>, or .oc-live-frame__content). */
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
  children?: ReactNode;
}

/** `.oc-live-frame`: a live page at a virtual size, scaled down to the frame width in pure CSS. */
export const LiveFrame = forwardRef<HTMLDivElement, LiveFrameProps>(function LiveFrame(
  { src, title = "", width = 1280, height = 720, static: isStatic = false, inBrowserFrame = false, className, style, children, ...rest },
  ref,
) {
  const size = { "--oc-live-w": width, "--oc-live-h": height } as CSSProperties;
  return (
    <div
      ref={ref}
      className={cx(inBrowserFrame && "oc-browser-frame__view", "oc-live-frame", isStatic && "oc-live-frame--static", className)}
      style={{ ...size, ...style }}
      {...rest}
    >
      {src ? <iframe src={src} title={title} loading="lazy" scrolling="no" tabIndex={isStatic ? -1 : undefined} /> : children}
    </div>
  );
});
