// File: packages/react/src/components/LazyImage.tsx | Map: props -> figure.oc-lazy (ratio, preview) -> img loading=lazy -> loaded / error state
// Same markup as packages/ui/snippets/lazy.html.
import { forwardRef, useState } from "react";
import type { CSSProperties, HTMLAttributes, ImgHTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface LazyImageProps extends HTMLAttributes<HTMLElement> {
  /** Without a src only the placeholder (shimmer or `preview`) is shown, with `role="img"` and `alt` as its name. */
  src?: string;
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
  /** A small square for a table row or a list (`oc-lazy--thumb`, 2.5rem). */
  thumb?: boolean;
}

/** `.oc-lazy`: an image that keeps its place, shows a placeholder and fades in once loaded. */
export const LazyImage = forwardRef<HTMLElement, LazyImageProps>(function LazyImage(
  { src, alt, width, height, ratio, preview, caption, loading = "lazy", imgProps, thumb, className, style, ...rest },
  ref,
) {
  const [state, setState] = useState<"" | "is-loaded" | "is-error">("");
  const vars = { ...(ratio ? { "--oc-lazy-ratio": ratio } : {}), ...(preview ? { "--oc-lazy-preview": `url(${preview})` } : {}), ...style } as CSSProperties;
  const cls = cx("oc-lazy", thumb && "oc-lazy--thumb", state, className);
  if (!src) {
    return (
      <figure ref={ref} className={cls} style={vars} role="img" aria-label={alt} {...rest}>
        {caption != null && <figcaption>{caption}</figcaption>}
      </figure>
    );
  }
  return (
    <figure ref={ref} className={cls} style={vars} {...rest}>
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
