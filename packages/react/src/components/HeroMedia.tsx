// File: packages/react/src/components/HeroMedia.tsx
// Map: props -> media type (video / image, from the extension when not set) -> scrim + align classes -> media layer
//      (video: poster + source only without reduced motion; image: alt) -> content in the container
// Same markup as the hero-media page (packages/ui/src/parts/site-hero-media.css).
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export type HeroMediaScrim = "start" | "end" | "full" | "none";
export type HeroMediaAlign = "start" | "center" | "end";

export interface HeroMediaProps extends HTMLAttributes<HTMLElement> {
  /** Video or image file behind the text. */
  src: string;
  /** "video" or "image"; default: video for .mp4 / .webm / .ogv / .mov, otherwise image. */
  type?: "video" | "image";
  /** Still image of the video: shown while it loads and instead of the video under reduced motion. */
  poster?: string;
  /** MIME type of the video source (default from the extension, e.g. video/webm). */
  mediaType?: string;
  /** Alternative text of an image; empty (default) = decorative. A video is always aria-hidden. */
  alt?: string;
  /** Dark layer for readable text: on the side where the text starts (default), the other side, everything, or none. */
  scrim?: HeroMediaScrim;
  /** Position of the text in the container. */
  align?: HeroMediaAlign;
  /** Text, buttons. */
  children?: ReactNode;
}

const VIDEO = /\.(mp4|webm|ogv|mov)(\?.*)?$/i;
const MIME: Record<string, string> = { mp4: "video/mp4", webm: "video/webm", ogv: "video/ogg", mov: "video/quicktime" };

/** Hero over the full width with a video or photo behind the text (`.oc-hero-media`, `--scrim-start/--scrim-end/--scrim`, `--center/--end`). */
export const HeroMedia = forwardRef<HTMLElement, HeroMediaProps>(function HeroMedia(
  { src, type, poster, mediaType, alt = "", scrim = "start", align = "start", className, children, ...rest },
  ref,
) {
  const isVideo = (type ?? (VIDEO.test(src) ? "video" : "image")) === "video";
  const ext = src.match(VIDEO)?.[1]?.toLowerCase();
  const scrimClass = scrim === "full" ? "oc-hero-media--scrim" : scrim !== "none" ? `oc-hero-media--scrim-${scrim}` : null;
  return (
    <section ref={ref} className={cx("oc-hero-media", scrimClass, align !== "start" && `oc-hero-media--${align}`, className)} {...rest}>
      {isVideo ? (
        <video className="oc-hero-media__media" poster={poster} autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
          <source src={src} type={mediaType ?? (ext ? MIME[ext] : undefined)} media="(prefers-reduced-motion: no-preference)" />
        </video>
      ) : (
        <img className="oc-hero-media__media" src={src} alt={alt} />
      )}
      <div className="oc-hero-media__content">{children}</div>
    </section>
  );
});
