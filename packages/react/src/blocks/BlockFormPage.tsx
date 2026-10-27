import { forwardRef } from "react";
import type { FormHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface BlockFormPageProps extends FormHTMLAttributes<HTMLFormElement> {
  /** Sticky action bar content (cancel + save buttons). */
  actions?: ReactNode;
}

/** `form.oc-block-formpage`: collapsible sections (children) with a sticky action bar. */
export const BlockFormPage = forwardRef<HTMLFormElement, BlockFormPageProps>(function BlockFormPage(
  { actions, className, children, ...rest },
  ref,
) {
  return (
    <form ref={ref} className={cx("oc-block-formpage", className)} {...rest}>
      {children}
      {actions != null && <div className="oc-block-formpage-actions">{actions}</div>}
    </form>
  );
});

/** `.oc-block-formpage-grid`: two-column field grid from 40rem. */
export function BlockFormPageGrid({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("oc-block-formpage-grid", className)} {...rest} />;
}
