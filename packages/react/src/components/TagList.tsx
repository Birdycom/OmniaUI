// File: packages/react/src/components/TagList.tsx
// Map: types -> TagList (ul.oc-tag-list -> li per tag, or your own li children)
// Same markup as the brand chips in packages/ui/snippets/feature-card.html.
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface TagListProps extends HTMLAttributes<HTMLUListElement> {
  /** One chip per entry; or pass your own <li> elements as children. */
  items?: ReactNode[];
  /** Chips without the accent color (`--neutral`). */
  neutral?: boolean;
  /** Larger chips in the display font (`--lg`), e.g. a strip of brand names. */
  size?: "md" | "lg";
}

/** `ul.oc-tag-list`: a wrapping row of rounded chips (tech stack, brands, skills). */
export const TagList = forwardRef<HTMLUListElement, TagListProps>(function TagList(
  { items, neutral, size = "md", className, children, ...rest },
  ref,
) {
  return (
    <ul ref={ref} className={cx("oc-tag-list", neutral && "oc-tag-list--neutral", size === "lg" && "oc-tag-list--lg", className)} {...rest}>
      {items?.map((item, i) => <li key={i}>{item}</li>)}
      {children}
    </ul>
  );
});
