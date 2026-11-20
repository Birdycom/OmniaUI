// File: packages/react/src/components/Paper.tsx
// Map: types -> paper classes (tone, sheet, writing pattern, edge, extras) -> Paper -> PaperLift
// Same markup as packages/ui/snippets/paper.html.
import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils";

export type PaperTone = "bright" | "ivory" | "gray" | "kraft";
export type PaperEdge = "torn" | "torn-top" | "torn-both" | "zigzag";

export interface PaperProps extends HTMLAttributes<HTMLElement> {
  /** Element of the surface (default div; section or body-like wrappers for `theme`). */
  as?: "div" | "section" | "article" | "aside" | "main";
  /** Paper tone; default the off-white base. */
  tone?: PaperTone;
  /** A single sheet with padding and a soft shadow (`--sheet`). */
  sheet?: boolean;
  /** No grain (`--smooth`). */
  smooth?: boolean;
  /** Ruled writing paper (`--lined`). */
  lined?: boolean;
  /** Red margin line on the start side (`--margin`). */
  margin?: boolean;
  /** Squared paper (`--grid`). */
  squares?: boolean;
  /** Dot grid (`--dots`). */
  dots?: boolean;
  /** Millimeter paper (`--mm`). */
  mm?: boolean;
  /** One cut edge: torn (bottom), torn-top, torn-both or a receipt zigzag. Wrap it in a PaperLift for a shadow that follows it. */
  edge?: PaperEdge;
  /** Punched holes on the start side (`--holes`). */
  holes?: boolean;
  /** Folded corner (`--fold`). */
  fold?: boolean;
  /** Two more sheets under it (`--stack`). */
  stack?: boolean;
  /** Off-white page tokens for everything inside (`.oc-paper-theme`). */
  theme?: boolean;
}

/** The class list of a paper surface, in the order of the snippet. */
export function paperClass(p: Omit<PaperProps, "as" | keyof HTMLAttributes<HTMLElement>>): string {
  return cx(
    p.theme && "oc-paper-theme",
    "oc-paper",
    p.tone && `oc-paper--${p.tone}`,
    p.sheet && "oc-paper--sheet",
    p.smooth && "oc-paper--smooth",
    p.lined && "oc-paper--lined",
    p.margin && "oc-paper--margin",
    p.squares && "oc-paper--grid",
    p.dots && "oc-paper--dots",
    p.mm && "oc-paper--mm",
    p.edge && `oc-paper--${p.edge}`,
    p.holes && "oc-paper--holes",
    p.fold && "oc-paper--fold",
    p.stack && "oc-paper--stack",
  );
}

/** `.oc-paper`: an off-white surface with a fine grain, tones, writing patterns and paper edges. */
export const Paper = forwardRef<HTMLElement, PaperProps>(function Paper(
  { as: Tag = "div", tone, sheet, smooth, lined, margin, squares, dots, mm, edge, holes, fold, stack, theme, className, children, ...rest },
  ref,
) {
  const cls = paperClass({ tone, sheet, smooth, lined, margin, squares, dots, mm, edge, holes, fold, stack, theme });
  return (
    <Tag ref={ref as never} className={cx(cls, className)} {...rest}>
      {children}
    </Tag>
  );
});

/** `.oc-paper-lift`: wrapper that gives a sheet with a cut edge (torn, zigzag, holes) a shadow that follows the edge. */
export const PaperLift = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function PaperLift({ className, children, ...rest }, ref) {
  return (
    <div ref={ref} className={cx("oc-paper-lift", className)} {...rest}>
      {children}
    </div>
  );
});
