// File: packages/react/src/components/LazyImage.tsx | Map: props -> figure.oc-lazy (ratio, preview) -> img loading=lazy -> loaded / error state
// Same markup as packages/ui/snippets/lazy.html.
import { forwardRef, useState } from "react";
import type { CSSProperties, HTMLAttributes, ImgHTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface LazyImageProps extends HTMLAttributes<HTMLElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  /** Aspect ratio of the box, e.g. "16 / 10" (default) or "1". */
  ratio?: string;
  /** URL of a tiny copy, shown blurred until the photo is there (instead of the shimmer). */
  preview?: string;
  caption?: ReactNode;
  /** "lazy" (default) or "eager" for images in the first screen. */
  loading?: "lazy" | "eager";
  imgProps?: ImgHTMLAttributes<HTMLImageElement>;
}

/** `.oc-lazy`: an image that keeps its place, shows a placeholder and fades in once loaded. */
export const LazyImage = forwardRef<HTMLElement, LazyImageProps>(function LazyImage(
  { src, alt, width, height, ratio, preview, caption, loading = "lazy", imgProps, className, style, ...rest },
  ref,
) {
  const [state, setState] = useState<"" | "is-loaded" | "is-error">("");
  const vars = { ...(ratio ? { "--oc-lazy-ratio": ratio } : {}), ...(preview ? { "--oc-lazy-preview": `url(${preview})` } : {}), ...style } as CSSProperties;
  return (
    <figure ref={ref} className={cx("oc-lazy", state, className)} style={vars} {...rest}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        onLoad={() => setState("is-loaded")}
        onError={() => setState("is-error")}
        {...imgProps}
      />
      {caption != null && <figcaption>{caption}</figcaption>}
    </figure>
  );
});
