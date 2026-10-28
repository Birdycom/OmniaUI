import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, "content"> {
  /** Tooltip text (`data-tooltip`); with `heading`, the lines under the title. */
  content: string;
  /** Keep the line breaks of `content` (`oc-tooltip--multiline`). */
  multiline?: boolean;
  /** Title above `content` (`.oc-tooltip__title`: larger, capital first letter); renders `.oc-tooltip__content`. */
  heading?: string;
  /** Preferred side (default top); with anchor positioning it moves to the other side when there is no room. */
  side?: "top" | "bottom" | "left" | "right";
  children: ReactNode;
}

/** `<span class="oc-tooltip" data-tooltip>`: CSS-only tooltip around its children. */
export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(function Tooltip({ content, multiline, heading, side, className, children, ...rest }, ref) {
  const classes = cx("oc-tooltip", multiline && !heading && "oc-tooltip--multiline", side && side !== "top" && `oc-tooltip--${side}`, className);
  if (!heading) return <span ref={ref} className={classes} data-tooltip={content} {...rest}>{children}</span>;
  return (
    <span ref={ref} className={classes} {...rest}>
      {children}
      <span className="oc-tooltip__content" role="tooltip">
        <span className="oc-tooltip__title">{heading}</span>
        {content}
      </span>
    </span>
  );
});
