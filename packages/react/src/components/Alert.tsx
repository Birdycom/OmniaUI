import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export type AlertVariant = "info" | "success" | "warning" | "danger";

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: AlertVariant;
  /** Heading (`oc-alert-title`). */
  title?: ReactNode;
}

/** `<div class="oc-alert oc-alert--{variant}" role="status">`; children render inside `oc-alert-description`. */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { variant = "info", title, children, className, role = "status", ...rest },
  ref,
) {
  return (
    <div ref={ref} role={role} className={cx("oc-alert", `oc-alert--${variant}`, className)} {...rest}>
      {title != null && <h4 className="oc-alert-title">{title}</h4>}
      {children != null && <p className="oc-alert-description">{children}</p>}
    </div>
  );
});
