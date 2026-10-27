// File: packages/react/src/components/AccordionAccent.tsx
// Map: AccordionAccent = div.oc-accordion.oc-accordion--accent (+ color) -> AccordionItem children
// Use the existing <AccordionItem> inside. Color an item with className "oc-accent--violet"
// or "oc-accordion-item--warning". AccordionAccentMeta is the small label at the end of a title.
import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils";

export type AccordionAccentPreset = "blue" | "cyan" | "green" | "orange" | "red" | "violet" | "yellow";
export type AccordionAccentTone = "success" | "warning" | "danger";

export interface AccordionAccentProps extends HTMLAttributes<HTMLDivElement> {
  /** Color preset for all items (an `.oc-accent--*` class). */
  accent?: AccordionAccentPreset;
  /** Semantic color for all items. */
  tone?: AccordionAccentTone;
  /** Only the accent edge, no card frame. */
  flush?: boolean;
}

/** `.oc-accordion--accent`: accordion with separate cards and a colored start edge. */
export const AccordionAccent = forwardRef<HTMLDivElement, AccordionAccentProps>(function AccordionAccent(
  { accent, tone, flush, className, ...rest },
  ref,
) {
  const cls = cx(
    "oc-accordion oc-accordion--accent",
    flush && "oc-accordion--flush",
    accent && `oc-accent--${accent}`,
    tone && `oc-accordion--${tone}`,
    className,
  );
  return <div ref={ref} className={cls} {...rest} />;
});

/** `.oc-accordion-accent-meta`: short accent-colored label inside an item title. */
export function AccordionAccentMeta({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cx("oc-accordion-accent-meta", className)} {...rest} />;
}
