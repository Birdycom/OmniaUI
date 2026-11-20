// File: packages/react/src/components/CodeWindow.tsx
// Map: props (title, code, copy labels) -> bar (three dots, title, copy button) -> body (plain code or children) -> copy
// Same markup as packages/ui/snippets/code-window.html.
"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface CodeWindowProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** File name in the bar (`.oc-code-window__title`). */
  title?: ReactNode;
  /** Plain code: shown in `pre.oc-code-window__body` and copied. Children (e.g. an `.oc-code-block`) replace the body. */
  code?: string;
  /** Copy button in the bar (default true). It copies `code`, else the text of the body. */
  copy?: boolean;
  /** Button text (default "Copy"). */
  copyLabel?: string;
  /** Button text right after copying (default "Copied"). */
  copiedLabel?: string;
  /** Always dark, also on a light page (`oc-code-window--dark`). */
  dark?: boolean;
}

/** Window frame around code with a copy button (`.oc-code-window`). */
export const CodeWindow = forwardRef<HTMLDivElement, CodeWindowProps>(function CodeWindow(
  { title, code, copy = true, copyLabel = "Copy", copiedLabel = "Copied", dark, className, children, ...rest },
  ref,
) {
  const body = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const onCopy = async () => {
    const text = code ?? body.current?.textContent ?? "";
    try { await navigator.clipboard?.writeText(text); } catch { /* no clipboard access */ }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div ref={ref} className={cx("oc-code-window", dark && "oc-code-window--dark", className)} {...rest}>
      <div className="oc-code-window__bar">
        <i></i><i></i><i></i>
        {title != null && <span className="oc-code-window__title">{title}</span>}
        {copy && <button type="button" className={cx("oc-code-copy", copied && "is-copied")} onClick={onCopy}>{copied ? copiedLabel : copyLabel}</button>}
      </div>
      {children != null
        ? <div ref={body}>{children}</div>
        : <pre className="oc-code-window__body"><code>{code}</code></pre>}
    </div>
  );
});
