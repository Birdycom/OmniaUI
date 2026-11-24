// File: packages/react/src/components/StatusDot.tsx | Map: types -> StatusDot (span.oc-status-dot) -> Status (p.oc-status: dot + text + meta)
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export type StatusTone = "default" | "working" | "waiting" | "done" | "error" | "idle";

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: StatusTone;
  size?: "sm" | "md" | "lg";
  /** Says the state when the dot stands alone (role="img"); without it the dot is aria-hidden. */
  label?: string;
}

/** `<span class="oc-status-dot oc-status-dot--{tone}">`: a live state light; --working pulses. */
export const StatusDot = forwardRef<HTMLSpanElement, StatusDotProps>(function StatusDot(
  { tone = "default", size = "md", label, className, ...rest },
  ref,
) {
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };
  return (
    <span
      ref={ref}
      className={cx("oc-status-dot", tone !== "default" && `oc-status-dot--${tone}`, size !== "md" && `oc-status-dot--${size}`, className)}
      {...a11y}
      {...rest}
    />
  );
});

export interface StatusProps extends HTMLAttributes<HTMLParagraphElement> {
  tone?: StatusTone;
  /** Right-aligned extra (a time, a count) in tabular numbers. */
  meta?: ReactNode;
  /** The state in words; cuts off with … on one line. */
  children?: ReactNode;
}

/** `<p class="oc-status">`: dot + one line of state text + optional meta. */
export const Status = forwardRef<HTMLParagraphElement, StatusProps>(function Status(
  { tone = "default", meta, className, children, ...rest },
  ref,
) {
  return (
    <p ref={ref} className={cx("oc-status", className)} {...rest}>
      <StatusDot tone={tone} />
      <span className="oc-status__text">{children}</span>
      {meta != null && <span className="oc-status__meta">{meta}</span>}
    </p>
  );
});

/** 0.18.0: `queued` (changes waiting to sync, with `count`) and `online` for a sync indicator. */
export type SaveState = "saving" | "saved" | "dirty" | "error" | "offline" | "queued" | "online";
const SAVE_TONE: Record<SaveState, StatusTone> = { saving: "working", saved: "done", dirty: "waiting", error: "error", offline: "idle", queued: "waiting", online: "done" };
const SAVE_EN: Record<SaveState, string> = { saving: "Saving…", saved: "Saved", dirty: "Unsaved changes", error: "Not saved", offline: "Offline: changes are kept on this device", queued: "Waiting to sync", online: "Online" };

/** The text of a save state; `queued` with a count: "3 changes waiting to sync". A custom label may hold {count}. */
export function saveStatusText(state: SaveState, labels?: Partial<Record<SaveState, string>>, count?: number): string {
  const own = labels?.[state];
  if (own != null) return own.replace("{count}", String(count ?? 0));
  if (state === "queued" && count != null) return `${count} ${count === 1 ? "change" : "changes"} waiting to sync`;
  return SAVE_EN[state];
}

export interface SaveStatusProps extends Omit<StatusProps, "tone" | "children"> {
  /** saving (pulsing dot) | saved | dirty (changes not saved yet) | error | offline. */
  state: SaveState;
  /** Texts in another language (any subset). */
  labels?: Partial<Record<SaveState, string>>;
  /** Time of the last save, shown on the right as "12:04" (when there is no `meta`). */
  savedAt?: Date | string | number;
  /** 0.18.0: number of changes waiting (state `queued`). */
  count?: number;
  /** 0.18.0: only the dot (`oc-status--compact`), e.g. on a menu button; the text stays for screen readers and as title. */
  compact?: boolean;
}

/** `.oc-status` for an editor (0.17.0) or a sync indicator (0.18.0: queued + count, online, compact): the save state in words with its dot, announced politely to a screen reader. */
export const SaveStatus = forwardRef<HTMLParagraphElement, SaveStatusProps>(function SaveStatus(
  { state, labels, savedAt, meta, count, compact, className, ...rest },
  ref,
) {
  const time = savedAt != null && meta == null
    ? new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date(savedAt))
    : meta;
  const text = saveStatusText(state, labels, count);
  if (compact) {
    return (
      <p ref={ref} className={cx("oc-status", "oc-status--compact", className)} role="status" aria-live="polite" data-state={state} title={text} {...rest}>
        <StatusDot tone={SAVE_TONE[state]} />
        {state === "queued" && count != null && count > 0 && <span className="oc-status__count" aria-hidden="true">{count}</span>}
        <span className="oc-status__text">{text}</span>
      </p>
    );
  }
  return (
    <Status ref={ref} tone={SAVE_TONE[state]} role="status" aria-live="polite" data-state={state} meta={time} className={className} {...rest}>
      {text}
    </Status>
  );
});
