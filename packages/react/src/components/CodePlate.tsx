// File: packages/react/src/components/CodePlate.tsx
// Map: types -> CodePlate (figure.oc-code-plate: the code, then the caption on the plate; "both" as two parts)
// A QR code or barcode on its own white plate (always light, also printed), with a caption on the plate itself, so the
// label is on a photo or a print of the code too. Same markup as snippets/code-plate.html.

import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import type { Mode } from "./ModeBadge";

export interface CodePlateProps extends HTMLAttributes<HTMLElement> {
  /** Caption on the plate under the code. With mode="both" and no caption: the two words side by side. */
  caption?: ReactNode;
  /** Colors the caption in the mode colors. */
  mode?: Mode;
  /** Words for mode="both" (default { test: "Test", live: "Live" }). */
  labels?: { test?: ReactNode; live?: ReactNode };
  /** Small plate (for a code of about 72px). */
  size?: "sm" | "md";
}

/** `figure.oc-code-plate`: the code (children) and its caption on one white plate. */
export const CodePlate = forwardRef<HTMLElement, CodePlateProps>(function CodePlate(
  { caption, mode, labels, size = "md", className, children, ...rest },
  ref,
) {
  const both = mode === "both" && caption == null;
  return (
    <figure ref={ref} className={cx("oc-code-plate", size === "sm" && "oc-code-plate--sm", className)} data-mode={mode} {...rest}>
      {children}
      {(caption != null || both) && (
        <figcaption className="oc-code-plate__caption">
          {both ? <><span>{labels?.test ?? "Test"}</span><span>{labels?.live ?? "Live"}</span></> : caption}
        </figcaption>
      )}
    </figure>
  );
});
