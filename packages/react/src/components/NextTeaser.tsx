// File: packages/react/src/components/NextTeaser.tsx | Map: props -> NextTeaser (a -> label -> name (+ mark) -> tagline)
import { forwardRef } from "react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface NextTeaserProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Small uppercase label (default "Next product"). */
  label?: ReactNode;
  name: ReactNode;
  tagline?: ReactNode;
  /** Element before the name, usually a <ProductMark size="sm" />. */
  mark?: ReactNode;
  /** "Previous" link: arrow left. */
  prev?: boolean;
}

/** `<a class="oc-next-teaser">`: "Next product" teaser card. */
export const NextTeaser = forwardRef<HTMLAnchorElement, NextTeaserProps>(function NextTeaser(
  { label = "Next product", name, tagline, mark, prev = false, className, ...rest },
  ref,
) {
  return (
    <a ref={ref} className={cx("oc-next-teaser", prev && "oc-next-teaser--prev", className)} {...rest}>
      {label != null && <span className="oc-next-teaser__label">{label}</span>}
      <span className="oc-next-teaser__name">{mark}{name}</span>
      {tagline != null && <span className="oc-next-teaser__tagline">{tagline}</span>}
    </a>
  );
});
