import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, "content"> {
  /** Tooltip text (`data-tooltip`). */
  content: string;
  children: ReactNode;
}

/** `<span class="oc-tooltip" data-tooltip>`: CSS-only tooltip around its children. */
export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(function Tooltip({ content, className, ...rest }, ref) {
  return <span ref={ref} className={cx("oc-tooltip", className)} data-tooltip={content} {...rest} />;
});
