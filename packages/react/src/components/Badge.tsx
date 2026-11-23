import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { Webicon } from "./Webicon";

export type BadgeVariant = "default" | "secondary" | "outline" | "destructive" | "success" | "warning" | "info" | "module" | "readonly";

/** 0.18.0: the ready-made statuses of `status` (tone, webicon and English label in `badgeStatuses`). */
export type BadgeStatus =
  | "paid" | "pending" | "overdue" | "draft" | "sent" | "cancelled" | "approved" | "rejected" | "active" | "inactive"
  | "archived" | "failed" | "refunded" | "scheduled" | "in-progress" | "done" | "read-only"
  | "working" | "waiting" | "error" | "idle";

export type BadgeStatusTone = "success" | "warning" | "destructive" | "info" | "neutral";

/** Tone, webicon and label per status. The colour comes from the CSS (`data-status`); the tone is listed for your own use. */
export const badgeStatuses: Record<BadgeStatus, { label: string; icon: string; tone: BadgeStatusTone }> = {
  paid: { label: "Paid", icon: "mdi:check-circle-outline", tone: "success" },
  pending: { label: "Pending", icon: "mdi:clock-outline", tone: "warning" },
  overdue: { label: "Overdue", icon: "mdi:alert-circle-outline", tone: "destructive" },
  draft: { label: "Draft", icon: "mdi:pencil-outline", tone: "neutral" },
  sent: { label: "Sent", icon: "mdi:send-outline", tone: "info" },
  cancelled: { label: "Cancelled", icon: "mdi:cancel", tone: "neutral" },
  approved: { label: "Approved", icon: "mdi:check-decagram-outline", tone: "success" },
  rejected: { label: "Rejected", icon: "mdi:close-circle-outline", tone: "destructive" },
  active: { label: "Active", icon: "mdi:circle-medium", tone: "success" },
  inactive: { label: "Inactive", icon: "mdi:circle-off-outline", tone: "neutral" },
  archived: { label: "Archived", icon: "mdi:archive-outline", tone: "neutral" },
  failed: { label: "Failed", icon: "mdi:alert-octagon-outline", tone: "destructive" },
  refunded: { label: "Refunded", icon: "mdi:cash-refund", tone: "info" },
  scheduled: { label: "Scheduled", icon: "mdi:calendar-clock-outline", tone: "info" },
  "in-progress": { label: "In progress", icon: "mdi:progress-clock", tone: "info" },
  done: { label: "Done", icon: "mdi:check", tone: "success" },
  "read-only": { label: "Read-only", icon: "mdi:lock-outline", tone: "neutral" },
  working: { label: "Working", icon: "mdi:progress-clock", tone: "info" },
  waiting: { label: "Waiting", icon: "mdi:timer-sand", tone: "warning" },
  error: { label: "Error", icon: "mdi:alert-circle-outline", tone: "destructive" },
  idle: { label: "Idle", icon: "mdi:sleep", tone: "neutral" },
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** `readonly` (0.18.0): a read-only value chip (a contact, an account), squarer and calmer, text cut off with … */
  variant?: BadgeVariant;
  /**
   * 0.18.0: a ready-made status (`"paid"`, `"overdue"`, `"in-progress"` …): `.oc-badge--status` + `data-status`, its webicon
   * and its English label. Children replace the label (translations), `icon` replaces the icon (`false`: none).
   * Any other name only sets `data-status` (give it a colour with `--oc-badge-status`).
   */
  status?: BadgeStatus | (string & {});
  /** Leading icon: a webicon name (`"mdi:check"`) or any node. Decorative; the text (or `title`) names the badge. */
  icon?: ReactNode;
  /** Tooltip; on a badge without text it is also the accessible name (`role="img"` + `aria-label`). */
  title?: string;
  /**
   * 0.17.0: module colour (`data-module`): blue, green, purple, gold, cyan, pink, red, orange, teal, slate, or your own name.
   * A default badge then takes the solid module colour; `variant="module"` is the soft tint (also from a module on an ancestor).
   */
  module?: string;
}

/** `<span class="oc-badge oc-badge--{variant}">`; with `status` a status badge with its icon before the label. */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge({ variant = "default", status, icon, title, module, className, children, ...rest }, ref) {
  const preset = status ? badgeStatuses[status as BadgeStatus] : undefined;
  const shownIcon = icon === undefined ? preset?.icon : icon === false ? null : icon;
  const hasText = !(children == null || children === false || children === "");
  const label = hasText ? children : preset?.label;
  const iconOnly = shownIcon != null && label == null;
  const a11y = iconOnly && title ? { role: "img", "aria-label": title } : {};
  const kind = status ? "status" : variant;
  return (
    <span ref={ref} className={cx("oc-badge", kind !== "default" && `oc-badge--${kind}`, className)} title={title} data-status={status || undefined} data-module={module || undefined} {...a11y} {...rest}>
      {shownIcon != null && (typeof shownIcon === "string" ? <Webicon name={shownIcon} bare fallback="iconify" /> : shownIcon)}
      {kind === "readonly" && label != null ? <span>{label}</span> : label}
    </span>
  );
});
