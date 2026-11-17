import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { webiconNode } from "./Webicon";

export type AlertVariant = "info" | "success" | "warning" | "danger";

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: AlertVariant;
  /** Heading (`oc-alert-title`). */
  title?: ReactNode;
  /** Compact message under a field or a form (an error, a hint). */
  inline?: boolean;
  /** Icon on the left (a webicon name or any node), in a soft circle in the tone. */
  icon?: ReactNode;
  /** Buttons on the right (Seen, Close). */
  actions?: ReactNode;
  /** An urgent message: "new" pulses until acknowledged (role alert), "seen" is calm. Default tone: danger. */
  alarm?: "new" | "seen";
}

/** `<div class="oc-alert oc-alert--{variant}" role="status">`; children render inside `oc-alert-description`. */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { variant, title, inline, icon, actions, alarm, children, className, role, ...rest },
  ref,
) {
  const tone = variant ?? (alarm ? "danger" : "info");
  const text = (
    <>
      {title != null && <h4 className="oc-alert-title">{title}</h4>}
      {children != null && <p className="oc-alert-description">{children}</p>}
    </>
  );
  const parts = icon != null || actions != null;
  return (
    <div
      ref={ref}
      role={role ?? (alarm === "new" ? "alert" : "status")}
      className={cx("oc-alert", `oc-alert--${tone}`, inline && "oc-alert--inline", alarm && "oc-alert--alarm", className)}
      data-state={alarm}
      {...rest}
    >
      {parts ? (
        <>
          {icon != null && <span className="oc-alert-icon" aria-hidden="true">{webiconNode(icon)}</span>}
          <div className="oc-alert-body">{text}</div>
          {actions != null && <div className="oc-alert-actions">{actions}</div>}
        </>
      ) : text}
    </div>
  );
});
