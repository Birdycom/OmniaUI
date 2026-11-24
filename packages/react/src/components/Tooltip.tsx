"use client";

import { Children, cloneElement, forwardRef, isValidElement, useId } from "react";
import type { CSSProperties, FocusEvent, HTMLAttributes, MouseEvent, ReactElement, ReactNode } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";
import { mergeIntoChild } from "../asChild";

export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, "content"> {
  /** Tooltip text (`data-tooltip`); with `heading`, the lines under the title. A node (0.17.0) renders rich content:
   *  `.oc-tooltip__content[role=tooltip]`, linked with `aria-describedby`. */
  content: ReactNode;
  /** Keep the line breaks of `content` (`oc-tooltip--multiline`). */
  multiline?: boolean;
  /** Title above `content` (`.oc-tooltip__title`: larger, capital first letter); renders `.oc-tooltip__content`. */
  heading?: string;
  /** Preferred side (default top); with anchor positioning it moves to the other side when there is no room. */
  side?: "top" | "bottom" | "left" | "right";
  /** Controlled visibility (0.17.0): `true` shows it (`.is-open`), `false` keeps it hidden, also on hover (`.is-closed`). */
  open?: boolean;
  /** Visible on the first render (uncontrolled). */
  defaultOpen?: boolean;
  /** Called when hover or keyboard focus shows or hides the tooltip. */
  onOpenChange?: (open: boolean) => void;
  /** Delay before showing, in ms (`--oc-tooltip-delay`; overrides the TooltipProvider). */
  delayDuration?: number;
  /** 0.18.0: put the tooltip on the only child itself (a button, a link) instead of a wrapping `<span>`: it gets
   *  `oc-tooltip` and `data-tooltip` (rich content is appended inside it). The child must be able to hold a `::after`
   *  (not an `<input>` or `<img>`). */
  asChild?: boolean;
  children: ReactNode;
}

export interface TooltipProviderProps {
  /** Delay before the tooltips inside show, in ms (CSS `--oc-tooltip-delay`). Default 0. */
  delayDuration?: number;
  /** Accepted for API compatibility; CSS tooltips have no shared skip timer. */
  skipDelayDuration?: number;
  children?: ReactNode;
}

/** Shared settings for the tooltips inside it: a `display: contents` wrapper (`.oc-tooltip-provider`) that sets `--oc-tooltip-delay`. */
export function TooltipProvider({ delayDuration, children }: TooltipProviderProps) {
  const style = delayDuration != null ? ({ "--oc-tooltip-delay": `${delayDuration}ms` } as CSSProperties) : undefined;
  return <span className="oc-tooltip-provider" style={style}>{children}</span>;
}

/** `<span class="oc-tooltip" data-tooltip>`: CSS-only tooltip around its children. */
export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(function Tooltip(
  { content, multiline, heading, side, open, defaultOpen, onOpenChange, delayDuration, asChild, className, style, children, onMouseEnter, onMouseLeave, onFocus, onBlur, ...rest },
  ref,
) {
  const contentId = `oc-tooltip-${useId().replace(/:/g, "")}`;
  const tracked = open !== undefined || defaultOpen !== undefined || onOpenChange != null;
  const [shown, setShown] = useControllable<boolean>(open, defaultOpen ?? false, onOpenChange);
  const plain = typeof content === "string" || typeof content === "number";
  const classes = cx(
    "oc-tooltip",
    multiline && !heading && "oc-tooltip--multiline",
    side && side !== "top" && `oc-tooltip--${side}`,
    tracked && (shown ? "is-open" : open === false ? "is-closed" : null),
    className,
  );
  const ownStyle = delayDuration != null ? ({ "--oc-tooltip-delay": `${delayDuration}ms`, ...style } as CSSProperties) : style;
  const handlers = tracked
    ? {
        onMouseEnter: (e: MouseEvent<HTMLSpanElement>) => { onMouseEnter?.(e); if (!shown) setShown(true); },
        onMouseLeave: (e: MouseEvent<HTMLSpanElement>) => { onMouseLeave?.(e); if (shown) setShown(false); },
        onFocus: (e: FocusEvent<HTMLSpanElement>) => { onFocus?.(e); if (!shown) setShown(true); },
        onBlur: (e: FocusEvent<HTMLSpanElement>) => { onBlur?.(e); if (shown) setShown(false); },
      }
    : { onMouseEnter, onMouseLeave, onFocus, onBlur };
  if (asChild) {
    const only = Children.toArray(children).filter(isValidElement);
    if (only.length === 1) {
      const child = only[0] as ReactElement<{ children?: ReactNode }>;
      const rich = heading || !plain;
      const filled = rich
        ? cloneElement(
          child,
          undefined,
          child.props.children,
          <span key="oc-tooltip-content" className="oc-tooltip__content" role="tooltip" id={contentId}>
            {heading && <span className="oc-tooltip__title">{heading}</span>}
            {content}
          </span>,
        )
        : child;
      const own = { className: classes, style: ownStyle, ...handlers, ...rest, ...(rich ? (plain ? {} : { "aria-describedby": contentId }) : { "data-tooltip": String(content) }) };
      const merged = mergeIntoChild(filled, own, ref);
      if (merged) return merged;
    }
  }
  if (!heading && plain) {
    return <span ref={ref} className={classes} style={ownStyle} data-tooltip={String(content)} {...handlers} {...rest}>{children}</span>;
  }
  return (
    <span ref={ref} className={classes} style={ownStyle} aria-describedby={plain ? undefined : contentId} {...handlers} {...rest}>
      {children}
      <span className="oc-tooltip__content" role="tooltip" id={contentId}>
        {heading && <span className="oc-tooltip__title">{heading}</span>}
        {content}
      </span>
    </span>
  );
});
