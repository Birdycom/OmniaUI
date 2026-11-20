// File: packages/react/src/components/Carousel.tsx
// Map: props (label, per view, loop, dots) -> slides (CarouselItem or any child, numbered "1 of 4") -> loop buttons ->
//      fallback dots -> carousel.js (bindDots / bindCarousel) after mount
// Same markup as packages/ui/snippets/carousel.html and carousel-loop.html.
"use client";

import { Children, cloneElement, forwardRef, isValidElement, useEffect, useId, useRef } from "react";
import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import { cx } from "../utils";
import { useMergedRef } from "../hooks";
import { bindCarousel, bindDots } from "../../../ui/src/carousel.js";

export interface CarouselProps extends HTMLAttributes<HTMLDivElement> {
  /** Accessible name of the viewport (default "Carousel"). */
  label?: string;
  /** Slides per view: halves (2) or thirds (3); default one. */
  per?: "halves" | "thirds";
  /** After the last slide comes the first again: real prev / next buttons (`oc-carousel--loop`). */
  loop?: boolean;
  /** Fallback dots (`.oc-carousel-dots`) for browsers without ::scroll-marker (default true). */
  dots?: boolean;
  /** aria-label of the dots (default "Choose a slide"). */
  dotsLabel?: string;
  /** Labels of the loop buttons. */
  labels?: { previous?: string; next?: string };
}

export interface CarouselItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Set by the Carousel: position and count ("2 of 4"). */
  index?: number;
  total?: number;
}

/** One slide: `.oc-carousel-item` (role="group", aria-roledescription="slide"). */
export const CarouselItem = forwardRef<HTMLDivElement, CarouselItemProps>(function CarouselItem({ index, total, className, ...rest }, ref) {
  return (
    <div
      ref={ref}
      className={cx("oc-carousel-item", className)}
      role="group"
      aria-roledescription="slide"
      aria-label={index != null && total != null ? `${index + 1} of ${total}` : undefined}
      {...rest}
    />
  );
});

/**
 * CSS scroll-snap carousel (`.oc-carousel`, `--halves/--thirds/--loop`) with ::scroll-button arrows and
 * ::scroll-marker dots; children become the slides (a `<CarouselItem>` keeps its own props). carousel.js wires the
 * fallback dots and the loop buttons after mount.
 */
export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(function Carousel(
  { label = "Carousel", per, loop, dots = true, dotsLabel = "Choose a slide", labels, id, className, children, ...rest },
  forwardedRef,
) {
  const inner = useRef<HTMLDivElement>(null);
  const ref = useMergedRef(inner, forwardedRef);
  const auto = useId().replace(/:/g, "");
  const base = id ?? `oc-carousel-${auto}`;
  const nodes: ReactNode[] = Children.toArray(children);
  const total = nodes.length;
  const slideId = (node: ReactNode, i: number) =>
    (isValidElement(node) && node.type === CarouselItem && (node.props as CarouselItemProps).id) || `${base}-slide-${i + 1}`;

  useEffect(() => {
    const root = inner.current;
    if (!root) return;
    if (loop) bindCarousel(root);
    if (dots) bindDots(root);
  }, [loop, dots, total]);

  return (
    <div ref={ref} id={id} className={cx("oc-carousel", per && `oc-carousel--${per}`, loop && "oc-carousel--loop", className)} {...rest}>
      <div className="oc-carousel-viewport" id={`${base}-viewport`} tabIndex={0} role="region" aria-roledescription="carousel" aria-label={label}>
        {nodes.map((node, i) =>
          isValidElement(node) && node.type === CarouselItem
            ? cloneElement(node as ReactElement<CarouselItemProps>, { id: slideId(node, i), index: i, total })
            : <CarouselItem key={i} id={slideId(node, i)} index={i} total={total}>{node}</CarouselItem>,
        )}
      </div>
      {loop && (
        <>
          <button className="oc-carousel-prev" type="button" aria-controls={`${base}-viewport`} aria-label={labels?.previous ?? "Previous slide"}>&larr;</button>
          <button className="oc-carousel-next" type="button" aria-controls={`${base}-viewport`} aria-label={labels?.next ?? "Next slide"}>&rarr;</button>
        </>
      )}
      {dots && total > 0 && (
        <nav className="oc-carousel-dots" aria-label={dotsLabel}>
          {nodes.map((node, i) => <a key={i} className="oc-carousel-dot" href={`#${slideId(node, i)}`} aria-label={`Slide ${i + 1}`}></a>)}
        </nav>
      )}
    </div>
  );
});
