// File: packages/react/src/components/DemoPanel.tsx
// Map: types -> DemoPanel (div.oc-demo -> title -> radio tablist (tabs) -> preview -> code panel)
// Same markup as packages/ui/snippets/demo-panel.html. The tabs are two radios: CSS shows the preview or the code, no JavaScript.
"use client";

import { forwardRef, useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface DemoPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** The code: a string is shown in a `pre.oc-code-window__body`; any node (a highlighted block) as it is. */
  code?: ReactNode;
  /** Small heading above the panel (`.oc-preview__title`). */
  title?: ReactNode;
  /** Preview and code in tabs (`--tabs`, default); false stacks the preview above the code. */
  tabs?: boolean;
  previewLabel?: ReactNode;
  codeLabel?: ReactNode;
  /** Accessible name of the tab group (default "View"). */
  label?: string;
  /** Name of the two radios (generated when left out; must be unique on the page). */
  name?: string;
  /** Start on the code tab. */
  defaultView?: "preview" | "code";
  /** Taller preview (`__preview--tall`). */
  tall?: boolean;
  /** Center the preview content (`__preview--center`). */
  center?: boolean;
}

/** `.oc-demo`: live preview with its code, stacked or in Preview / Code tabs. */
export const DemoPanel = forwardRef<HTMLDivElement, DemoPanelProps>(function DemoPanel(
  { code, title, tabs = true, previewLabel = "Preview", codeLabel = "Code", label = "View", name, defaultView = "preview", tall, center, className, children, ...rest },
  ref,
) {
  const auto = useId();
  const group = name ?? `oc-demo-${auto.replace(/:/g, "")}`;
  const codeNode = typeof code === "string" ? <pre className="oc-code-window__body"><code>{code}</code></pre> : code;
  return (
    <div ref={ref} className={cx("oc-demo", tabs && "oc-demo--tabs", className)} {...rest}>
      {title != null && <p className="oc-preview__title">{title}</p>}
      {tabs && (
        <div className="oc-demo__tablist" role="radiogroup" aria-label={label}>
          <label className="oc-demo__tab"><input type="radio" name={group} defaultChecked={defaultView !== "code"} /> {previewLabel}</label>
          <label className="oc-demo__tab"><input type="radio" name={group} defaultChecked={defaultView === "code"} /> {codeLabel}</label>
        </div>
      )}
      <div className={cx("oc-demo__preview", tall && "oc-demo__preview--tall", center && "oc-demo__preview--center")}>{children}</div>
      {code != null && <div className="oc-demo__code">{codeNode}</div>}
    </div>
  );
});
