// File: packages/react/src/components/Marquee.tsx | Map: props -> Marquee (track with items + aria-hidden copy)
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface MarqueeProps extends HTMLAttributes<HTMLDivElement> {
  /** Items of the strip. They are rendered twice; the copy is aria-hidden. */
  items: ReactNode[];
  reverse?: boolean;
  speed?: "default" | "slow" | "fast";
  /** Text only, no pills. */
  plain?: boolean;
  /** No soft fade at the edges. */
  noFade?: boolean;
}

/** `.oc-marquee`: endless strip that pauses on hover / focus and stands still with reduced motion. */
export const Marquee = forwardRef<HTMLDivElement, MarqueeProps>(function Marquee(
  { items, reverse = false, speed = "default", plain = false, noFade = false, className, ...rest },
  ref,
) {
  const classes = cx(
    "oc-marquee",
    reverse && "oc-marquee--reverse",
    speed !== "default" && `oc-marquee--${speed}`,
    plain && "oc-marquee--plain",
    noFade && "oc-marquee--no-fade",
    className,
  );
  return (
    <div ref={ref} className={classes} {...rest}>
      <div className="oc-marquee__track">
        {items.map((item, i) => <span className="oc-marquee__item" key={i}>{item}</span>)}
        {items.map((item, i) => <span className="oc-marquee__item" aria-hidden="true" key={`copy-${i}`}>{item}</span>)}
      </div>
    </div>
  );
});
