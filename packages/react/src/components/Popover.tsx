"use client";

import { createContext, forwardRef, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, HTMLAttributes, MouseEvent, ReactNode, RefObject } from "react";
import { attrs, cx } from "../utils";
import { useControllable, useMergedRef } from "../hooks";
import { mergeIntoChild } from "../asChild";
import { Button } from "./Button";
import type { ButtonProps } from "./Button";

export interface PopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Content of the trigger button. Leave it out for the compound API: `<PopoverTrigger>`, `<PopoverContent>` (and
   *  `<PopoverAnchor>`) as children. */
  trigger?: ReactNode;
  triggerProps?: ButtonProps;
  size?: "sm" | "md" | "lg";
  title?: ReactNode;
  /** Short body text (`oc-popover-text`). */
  text?: ReactNode;
  /** Compound API: open state (controlled); with `onOpenChange`. */
  open?: boolean;
  /** Compound API: open on the first render (uncontrolled). */
  defaultOpen?: boolean;
  /** Compound API: called with the new open state (trigger click, Esc, outside click, close()). */
  onOpenChange?: (open: boolean) => void;
}

/** Trigger + `<div class="oc-popover" popover>` floating panel. Without `trigger`: root of the compound Popover. */
export const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  { trigger, triggerProps, size = "md", title, text, open, defaultOpen, onOpenChange, className, id, children, ...rest },
  ref,
) {
  const auto = useId();
  const panelId = id ?? `oc-popover-${auto.replace(/:/g, "")}`;
  if (trigger == null) {
    return <PopoverRoot id={panelId} open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>{children}</PopoverRoot>;
  }
  return (
    <>
      <Button variant="outline" type="button" {...triggerProps} popoverTarget={panelId}>{trigger}</Button>
      <div ref={ref} className={cx("oc-popover", size !== "md" && `oc-popover--${size}`, className)} id={panelId} {...attrs({ popover: "" })} {...rest}>
        {title != null && <h3 className="oc-popover-title">{title}</h3>}
        {text != null && <p className="oc-popover-text">{text}</p>}
        {children}
      </div>
    </>
  );
});

/* ---------------------------------------------------------------------------------------------
 * Compound Popover (0.17.0): <Popover open onOpenChange><PopoverAnchor/>?<PopoverTrigger>Open</PopoverTrigger>
 * <PopoverContent side="bottom" align="start">...</PopoverContent></Popover>. Native popover in the top layer; the
 * trigger is the implicit anchor (popovertarget), PopoverAnchor names another one (CSS anchor positioning, with a
 * getBoundingClientRect fallback where the browser has none).
 * ------------------------------------------------------------------------------------------- */

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  anchorName: string;
  anchorRef: RefObject<HTMLElement | null>;
  triggerRef: RefObject<HTMLElement | null>;
  anchored: boolean;
  setAnchored: (on: boolean) => void;
}
const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopover(part: string): PopoverContextValue {
  const ctx = useContext(PopoverContext);
  if (!ctx) throw new Error(`<${part}> must be used inside <Popover> without a trigger prop.`);
  return ctx;
}

function PopoverRoot({ id, open, defaultOpen, onOpenChange, children }: { id: string; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; children?: ReactNode }) {
  const [isOpen, setOpen] = useControllable<boolean>(open, defaultOpen ?? false, onOpenChange);
  const anchorRef = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [anchored, setAnchored] = useState(false);
  return (
    <PopoverContext.Provider value={{ open: isOpen, setOpen, contentId: id, anchorName: `--${id}`, anchorRef, triggerRef, anchored, setAnchored }}>
      {children}
    </PopoverContext.Provider>
  );
}

export interface PopoverTriggerProps extends ButtonProps {
  /** Merge the trigger into the only child (it must be a <button>) instead of rendering an outline Button. */
  asChild?: boolean;
}

/** Opens and closes the compound Popover (`popovertarget`, so it is also the implicit anchor). */
export const PopoverTrigger = forwardRef<HTMLButtonElement, PopoverTriggerProps>(function PopoverTrigger({ asChild, children, ...rest }, forwardedRef) {
  const ctx = usePopover("PopoverTrigger");
  const ref = useMergedRef<HTMLButtonElement>(forwardedRef, ctx.triggerRef as RefObject<HTMLButtonElement | null>);
  const props = { popoverTarget: ctx.contentId, "aria-expanded": ctx.open, "aria-controls": ctx.contentId, "aria-haspopup": "dialog" as const };
  if (asChild) {
    const merged = mergeIntoChild(children, { ...rest, ...props }, ref);
    if (merged) return merged;
  }
  return <Button ref={ref} variant="outline" type="button" {...rest} {...props}>{children}</Button>;
});

export interface PopoverAnchorProps extends HTMLAttributes<HTMLDivElement> {
  /** Name the only child as anchor instead of wrapping it in a <div>. */
  asChild?: boolean;
}

/** Positions PopoverContent against this element instead of the trigger (`anchor-name` + `position-anchor`). */
export const PopoverAnchor = forwardRef<HTMLDivElement, PopoverAnchorProps>(function PopoverAnchor({ asChild, style, children, ...rest }, forwardedRef) {
  const ctx = usePopover("PopoverAnchor");
  const ref = useMergedRef<HTMLDivElement>(forwardedRef, ctx.anchorRef as RefObject<HTMLDivElement | null>);
  const { setAnchored } = ctx;
  useEffect(() => {
    setAnchored(true);
    return () => setAnchored(false);
  }, [setAnchored]);
  const anchorStyle = { anchorName: ctx.anchorName, ...style } as CSSProperties;
  if (asChild) {
    const merged = mergeIntoChild(children, { ...rest, style: anchorStyle, "data-oc-popover-anchor": "" }, ref);
    if (merged) return merged;
  }
  return <div ref={ref} style={anchorStyle} data-oc-popover-anchor="" {...rest}>{children}</div>;
});

export type PopoverSide = "top" | "right" | "bottom" | "left";
export type PopoverAlign = "start" | "center" | "end";

export interface PopoverContentProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Side of the trigger (or anchor) the panel opens on. Default bottom; flips when there is no room. */
  side?: PopoverSide;
  /** Alignment along that side. Default start. */
  align?: PopoverAlign;
  /** Gap between anchor and panel in px (default 4). */
  sideOffset?: number;
  size?: "sm" | "md" | "lg";
  title?: ReactNode;
  text?: ReactNode;
  /** 0.18.0: render the children only from the first open on (heavy content, data that loads on open). They stay
   *  mounted after closing, unless `unmountOnClose`. `title` and `text` always render. */
  lazy?: boolean;
  /** 0.18.0: with `lazy`, unmount the children again when the panel closes (fresh state on every open). */
  unmountOnClose?: boolean;
  /** 0.18.0: the panel is as wide as its trigger (or PopoverAnchor): `data-match-width`, CSS `anchor-size(width)`,
   *  the trigger width in px where the browser has no anchor positioning. */
  matchTriggerWidth?: boolean;
}

/** Whether the browser positions with CSS anchors (no JS placement needed). */
const supportsAnchors = () => typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("anchor-name: --oc-a");

const OPPOSITE: Record<PopoverSide, PopoverSide> = { top: "bottom", bottom: "top", left: "right", right: "left" };

/**
 * Fixed `top`/`left` (px) for a panel of `panel` size next to `anchor`, for browsers without anchor positioning.
 * 0.18.0: with `viewport` ({ width, height }) it flips to the opposite side when the preferred side has no room and the
 * other has more, and shifts along the side so the panel stays `margin` px (default 8) inside the viewport; `side` in the
 * result is then the side it ended up on.
 */
export function popoverPosition(
  anchor: { top: number; left: number; width: number; height: number },
  panel: { width: number; height: number },
  side: PopoverSide = "bottom",
  align: PopoverAlign = "start",
  offset = 4,
  viewport?: { width: number; height: number },
  margin = 8,
): { top: number; left: number; side?: PopoverSide } {
  const along = (start: number, size: number, own: number) => (align === "start" ? start : align === "end" ? start + size - own : start + (size - own) / 2);
  const at = (s: PopoverSide) => {
    if (s === "top") return { top: anchor.top - panel.height - offset, left: along(anchor.left, anchor.width, panel.width) };
    if (s === "left") return { top: along(anchor.top, anchor.height, panel.height), left: anchor.left - panel.width - offset };
    if (s === "right") return { top: along(anchor.top, anchor.height, panel.height), left: anchor.left + anchor.width + offset };
    return { top: anchor.top + anchor.height + offset, left: along(anchor.left, anchor.width, panel.width) };
  };
  if (!viewport) return at(side);
  // Room on each side of the anchor.
  const room = (s: PopoverSide) =>
    s === "top" ? anchor.top - margin
      : s === "bottom" ? viewport.height - (anchor.top + anchor.height) - margin
        : s === "left" ? anchor.left - margin
          : viewport.width - (anchor.left + anchor.width) - margin;
  const need = (s: PopoverSide) => (s === "top" || s === "bottom" ? panel.height : panel.width) + offset;
  let used = side;
  if (room(side) < need(side) && room(OPPOSITE[side]) > room(side)) used = OPPOSITE[side];
  const p = at(used);
  const clamp = (v: number, own: number, max: number) => Math.max(margin, Math.min(v, max - own - margin));
  if (used === "top" || used === "bottom") p.left = clamp(p.left, panel.width, viewport.width);
  else p.top = clamp(p.top, panel.height, viewport.height);
  return { ...p, side: used };
}

/** `<div class="oc-popover" popover>` of the compound Popover, synced with the open state. */
export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(function PopoverContent(
  { side = "bottom", align = "start", sideOffset, size = "md", title, text, lazy, unmountOnClose, matchTriggerWidth, className, style, children, ...rest },
  forwardedRef,
) {
  const ctx = usePopover("PopoverContent");
  // lazy: children from the first open on (and only while open with unmountOnClose).
  const [opened, setOpened] = useState(ctx.open);
  if (ctx.open && !opened) setOpened(true);
  const renderChildren = !lazy || (unmountOnClose ? ctx.open : opened || ctx.open);
  const inner = useRef<HTMLDivElement>(null);
  const ref = useMergedRef(inner, forwardedRef);
  const { open, setOpen } = ctx;
  const openRef = useRef(open);
  openRef.current = open;

  // Native toggles (trigger click, Esc, light dismiss) -> onOpenChange.
  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    const onToggle = (e: Event) => {
      const now = (e as Event & { newState?: string }).newState === "open";
      if (now !== openRef.current) setOpen(now);
    };
    el.addEventListener("toggle", onToggle);
    return () => el.removeEventListener("toggle", onToggle);
  }, [setOpen]);

  // State -> native popover (controlled open, or a toggle the owner turned down).
  useLayoutEffect(() => {
    const el = inner.current;
    if (!el || typeof el.showPopover !== "function") return;
    let shown = false;
    try { shown = el.matches(":popover-open"); } catch { shown = false; }
    try {
      if (open && !shown) el.showPopover();
      else if (!open && shown) el.hidePopover();
    } catch { /* not connected or not a popover */ }
    if (open && !supportsAnchors()) {
      const target = (ctx.anchored ? ctx.anchorRef.current : null) ?? ctx.triggerRef.current;
      if (target) {
        const r = target.getBoundingClientRect();
        if (matchTriggerWidth) el.style.width = `${r.width}px`;
        const view = typeof window !== "undefined" ? { width: window.innerWidth, height: window.innerHeight } : undefined;
        const p = popoverPosition(r, { width: el.offsetWidth, height: el.offsetHeight }, side, align, sideOffset ?? 4, view);
        el.style.top = `${p.top}px`;
        el.style.left = `${p.left}px`;
      }
    }
  }, [open, side, align, sideOffset, matchTriggerWidth, renderChildren, ctx.anchored, ctx.anchorRef, ctx.triggerRef]);

  const vars = {
    ...(sideOffset != null ? { "--oc-popover-offset": `${sideOffset}px` } : {}),
    ...(ctx.anchored ? { positionAnchor: ctx.anchorName } : {}),
    ...style,
  } as CSSProperties;
  return (
    <div
      ref={ref}
      className={cx("oc-popover", size !== "md" && `oc-popover--${size}`, className)}
      id={ctx.contentId}
      role="dialog"
      data-side={side}
      data-align={align}
      data-state={open ? "open" : "closed"}
      data-match-width={matchTriggerWidth ? "" : undefined}
      style={vars}
      {...attrs({ popover: "" })}
      {...rest}
    >
      {title != null && <h3 className="oc-popover-title">{title}</h3>}
      {text != null && <p className="oc-popover-text">{text}</p>}
      {renderChildren ? children : null}
    </div>
  );
});

/** A button that closes the surrounding compound Popover. */
export const PopoverClose = forwardRef<HTMLButtonElement, ButtonProps>(function PopoverClose({ onClick, ...rest }, ref) {
  const ctx = usePopover("PopoverClose");
  const close = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (!e.defaultPrevented) ctx.setOpen(false);
  }, [onClick, ctx]);
  return <Button ref={ref} type="button" {...rest} onClick={close} />;
});
