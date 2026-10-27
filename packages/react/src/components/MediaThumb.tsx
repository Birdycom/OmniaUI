// File: packages/react/src/components/MediaThumb.tsx
// Map: props -> MediaThumb (<a> or <div> -> picture -> badge -> duration -> progress)
// Same markup as packages/ui/snippets/media-thumb.html.
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface MediaThumbProps extends HTMLAttributes<HTMLElement> {
  /** Picture URL. Empty = placeholder art (`.oc-media-art`, pick a variant with `art`). */
  src?: string;
  alt?: string;
  /** Placeholder art variant 1-6 (only without `src`). */
  art?: number;
  /** Renders an <a> when set. */
  href?: string;
  /** "12:04" in the bottom-right corner. */
  duration?: ReactNode;
  /** Top-left label ("New", "LIVE"). */
  badge?: ReactNode;
  live?: boolean;
  /** Watched part, 0-100. Shows the progress bar when set. */
  progress?: number;
  watched?: boolean;
  ratio?: "video" | "square" | "portrait";
}

/** `.oc-media-thumb`: 16:9 video thumbnail. */
export const MediaThumb = forwardRef<HTMLElement, MediaThumbProps>(function MediaThumb(
  { src, alt = "", art, href, duration, badge, live, progress, watched, ratio = "video", className, children, ...rest },
  ref,
) {
  const Tag = (href ? "a" : "div") as "a";
  return (
    <Tag
      ref={ref as React.Ref<HTMLAnchorElement>}
      href={href}
      className={cx("oc-media-thumb", ratio !== "video" && `oc-media-thumb--${ratio}`, watched && "is-watched", className)}
      {...(rest as HTMLAttributes<HTMLAnchorElement>)}
    >
      {src ? <img src={src} alt={alt} /> : <div className={cx("oc-media-art", art != null && art > 1 && `oc-media-art--${art}`)} />}
      {badge != null && <span className={cx("oc-media-thumb__badge", live && "oc-media-thumb__badge--live")}>{badge}</span>}
      {duration != null && <span className="oc-media-thumb__duration">{duration}</span>}
      {progress != null && (
        <progress className="oc-media-thumb__progress" value={progress} max={100} aria-label={`Watched ${progress}%`}>{progress}%</progress>
      )}
      {children}
    </Tag>
  );
});
