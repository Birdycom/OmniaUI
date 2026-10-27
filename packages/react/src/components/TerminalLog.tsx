// File: packages/react/src/components/TerminalLog.tsx
// Map: types -> TerminalLog (bar: dots, title, status -> body role=log: lines + prompt) -> auto-scroll effect
// Same markup as packages/ui/snippets/terminal-log.html. New lines scroll into view (autoScroll).
"use client";

import { forwardRef, useEffect, useRef } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export type TerminalLogLevel = "info" | "success" | "warn" | "error" | "debug";

export interface TerminalLogLine {
  level: TerminalLogLevel;
  message: ReactNode;
  /** "09:41:02". Leave out for a two-column line. */
  time?: string;
  /** Text in the level column (defaults to the level name; "ok" for success). */
  label?: string;
}

export interface TerminalLogProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  lines: TerminalLogLine[];
  title?: ReactNode;
  /** Text next to the pulsing dot ("Live"). No dot when empty. */
  status?: ReactNode;
  /** Prompt line with a blinking cursor. `true` = empty prompt. */
  prompt?: ReactNode | true;
  /** Max height of the body, e.g. "12rem". */
  height?: string;
  /** Keep the newest line in view. Default true. */
  autoScroll?: boolean;
}

/** `.oc-terminal-log`: dark console window. */
export const TerminalLog = forwardRef<HTMLDivElement, TerminalLogProps>(function TerminalLog(
  { lines, title, status, prompt, height, autoScroll = true, className, style, "aria-label": label = "Log output", ...rest },
  ref,
) {
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (autoScroll && body.current) body.current.scrollTop = body.current.scrollHeight;
  }, [lines.length, autoScroll]);
  const vars = height ? ({ "--oc-terminal-log-height": height } as CSSProperties) : undefined;
  return (
    <div ref={ref} className={cx("oc-terminal-log", className)} style={{ ...vars, ...style }} {...rest}>
      <div className="oc-terminal-log__bar">
        <i /><i /><i />
        {title != null && <span className="oc-terminal-log__title">{title}</span>}
        {status != null && <span className="oc-terminal-log__status">{status}</span>}
      </div>
      <div ref={body} className="oc-terminal-log__body" role="log" aria-live="polite" aria-label={label} tabIndex={0}>
        {lines.map((l, i) => (
          <p key={i} className={cx("oc-terminal-log__line", `oc-terminal-log__line--${l.level}`)}>
            {l.time && <time className="oc-terminal-log__time">{l.time}</time>}
            <span className="oc-terminal-log__level">{l.label ?? (l.level === "success" ? "ok" : l.level)}</span>
            <span className="oc-terminal-log__msg">{l.message}</span>
          </p>
        ))}
        {prompt != null && prompt !== false && <p className="oc-terminal-log__prompt">{prompt === true ? null : prompt}</p>}
      </div>
    </div>
  );
});
