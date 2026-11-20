// Same markup as packages/ui/snippets/hover-card.html.
import { forwardRef, useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { attrs, cx } from "../utils";

export interface HoverCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Text of the default trigger link. */
  label?: ReactNode;
  /** Target of the default trigger link (default "#"). */
  href?: string;
  /** Own trigger instead of the link: give it `interestfor={id}` and class `oc-hover-card-trigger`. */
  trigger?: (id: string) => ReactNode;
  /** Open above the trigger (`oc-hover-card--top`). */
  top?: boolean;
  /** Narrow card (`oc-hover-card-content--sm`). */
  small?: boolean;
}

/**
 * Preview on hover or focus (`interestfor` + `popover`, with a CSS hover fallback). Other props land on the
 * content element (`.oc-hover-card-content`); children are the card content.
 */
export const HoverCard = forwardRef<HTMLDivElement, HoverCardProps>(function HoverCard(
  { label, href = "#", trigger, top, small, id, className, children, ...rest },
  ref,
) {
  const auto = useId();
  const cardId = id ?? `oc-hover-card-${auto.replace(/:/g, "")}`;
  return (
    <span className={cx("oc-hover-card", top && "oc-hover-card--top")}>
      {trigger ? trigger(cardId) : <a className="oc-hover-card-trigger" href={href} {...attrs({ interestfor: cardId })}>{label}</a>}
      <div ref={ref} id={cardId} className={cx("oc-hover-card-content", small && "oc-hover-card-content--sm", className)} {...attrs({ popover: "" })} {...rest}>
        {children}
      </div>
    </span>
  );
});
