import { forwardRef } from "react";
import type { DetailsHTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface FormSectionProps extends Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "title"> {
  title: ReactNode;
  hint?: ReactNode;
  /** Webicon or SVG in the tinted square. */
  icon?: ReactNode;
  /** Right side of the header: a badge (Complete, 1 error) … */
  status?: ReactNode;
  /** Your own check found something: a red ("error") or orange ("warning") edge, also while closed. */
  invalid?: "error" | "warning";
  /** Number of problems, shown as a small count in the header (with `invalid`). */
  issues?: number;
  /** Accessible text for the count (default "3 errors" / "3 warnings"). */
  issuesLabel?: string;
  /** Tighter header and body (`.oc-form-section--dense`), for long forms in a panel. */
  dense?: boolean;
  /** Open on first render; the visitor opens and closes it after that (use `open` to control it yourself). */
  defaultOpen?: boolean;
  /** 0.17.0: module colour (`data-module`): blue, green, purple, gold, cyan, pink, red, orange, teal, slate, or your own name. */
  module?: string;
}

/** `<details class="oc-form-section">`: icon, title, hint, status; children are the fields (responsive grid). */
export const FormSection = forwardRef<HTMLDetailsElement, FormSectionProps>(function FormSection(
  { title, hint, icon, status, invalid, issues, issuesLabel, dense, defaultOpen, module, className, children, ...rest },
  ref,
) {
  return (
    <details ref={ref} className={cx("oc-form-section", dense && "oc-form-section--dense", className)} data-issue={invalid} data-module={module || undefined} {...(defaultOpen ? { open: true } : {})} {...rest}>
      <summary className="oc-form-section__summary">
        <span className="oc-form-section__icon">{icon}</span>
        <span className="oc-form-section__heading">
          <span className="oc-form-section__title">{title}</span>
          {hint && <span className="oc-form-section__hint">{hint}</span>}
        </span>
        <span className="oc-form-section__status">
          {invalid && issues != null && issues > 0 && (
            <span className="oc-form-section__count" role="img" aria-label={issuesLabel ?? `${issues} ${invalid === "warning" ? "warning" : "error"}${issues === 1 ? "" : "s"}`}>{issues}</span>
          )}
          {status}
        </span>
      </summary>
      <div className="oc-form-section__body">{children}</div>
    </details>
  );
});
