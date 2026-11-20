// Same markup as packages/ui/snippets/resizable.html.
import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils";

export interface ResizableProps extends HTMLAttributes<HTMLDivElement> {
  /** Panels on top of each other (`oc-resizable--vertical`). */
  vertical?: boolean;
  /** One box that resizes in both directions (`oc-resizable-box`). */
  box?: boolean;
}

/** Resizable panels with CSS `resize` (`.oc-resizable`): no JavaScript. Give it a block-size. */
export const Resizable = forwardRef<HTMLDivElement, ResizableProps>(function Resizable({ vertical, box, className, ...rest }, ref) {
  return <div ref={ref} className={cx(box && "oc-resizable-box", "oc-resizable", vertical && "oc-resizable--vertical", className)} {...rest} />;
});

export interface ResizablePanelProps extends HTMLAttributes<HTMLDivElement> {
  /** This panel gets the resize grip (`oc-resizable-panel--resizable`); the others take the remaining space. */
  resizable?: boolean;
}

/** One pane (`.oc-resizable-panel`). */
export const ResizablePanel = forwardRef<HTMLDivElement, ResizablePanelProps>(function ResizablePanel({ resizable, className, ...rest }, ref) {
  return <div ref={ref} className={cx("oc-resizable-panel", resizable && "oc-resizable-panel--resizable", className)} {...rest} />;
});
