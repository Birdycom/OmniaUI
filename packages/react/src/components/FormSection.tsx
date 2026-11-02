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
}

/** `<details class="oc-form-section">`: icon, title, hint, status; children are the fields (responsive grid). */
export const FormSection = forwardRef<HTMLDetailsElement, FormSectionProps>(function FormSection(
  { title, hint, icon, status, className, children, ...rest },
  ref,
) {
  return (
    <details ref={ref} className={cx("oc-form-section", className)} {...rest}>
      <summary className="oc-form-section__summary">
        <span className="oc-form-section__icon">{icon}</span>
        <span className="oc-form-section__heading">
          <span className="oc-form-section__title">{title}</span>
          {hint && <span className="oc-form-section__hint">{hint}</span>}
        </span>
        <span className="oc-form-section__status">{status}</span>
      </summary>
      <div className="oc-form-section__body">{children}</div>
    </details>
  );
});
