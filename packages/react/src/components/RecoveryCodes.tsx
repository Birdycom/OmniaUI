"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { Webicon } from "./Webicon";

export interface RecoveryCodesProps extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "onCopy"> {
  codes: string[];
  title?: ReactNode;
  warning?: ReactNode;
  copyLabel?: string;
  /** Feedback on the copy button and in a live region after copying (default "Copied"). */
  copiedLabel?: string;
  downloadLabel?: string;
  /** A "Print" button (prints only the codes). Default false. */
  print?: boolean;
  printLabel?: string;
  /** File name of the download (default `recovery-codes.txt`). */
  fileName?: string;
  /** Icons on the buttons and at the warning (Omnia webicons). Default true. */
  icons?: boolean;
  onCopy?: (codes: string[]) => void;
  onDownload?: (codes: string[]) => void;
  onPrint?: (codes: string[]) => void;
}

const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);

/** Print only the codes: a hidden iframe with the title and the list, so the rest of the page stays off the paper. */
export function printRecoveryCodes(codes: string[], title = "Recovery codes") {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;inline-size:0;block-size:0;border:0;inset:auto auto 0 0";
  frame.srcdoc = `<!doctype html><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>body{font:14px ui-monospace,Consolas,monospace;margin:2cm}h1{font:600 16px system-ui,sans-serif}ul{list-style:none;padding:0;columns:2}</style><h1>${escapeHtml(title)}</h1><ul>${codes.map((c) => `<li>${escapeHtml(c)}</li>`).join("")}</ul>`;
  frame.addEventListener("load", () => {
    frame.contentWindow?.print();
    setTimeout(() => frame.remove(), 1000);
  });
  document.body.append(frame);
}

/** `.oc-recovery-codes`: warning panel with a code grid, "Copy all", "Download .txt" and optionally "Print". */
export const RecoveryCodes = forwardRef<HTMLDivElement, RecoveryCodesProps>(function RecoveryCodes(
  {
    codes,
    title = "Recovery codes",
    warning = "Store these codes somewhere safe. Each code works once.",
    copyLabel = "Copy all",
    copiedLabel = "Copied",
    downloadLabel = "Download .txt",
    print = false,
    printLabel = "Print",
    fileName = "recovery-codes.txt",
    icons = true,
    onCopy,
    onDownload,
    onPrint,
    className,
    ...rest
  },
  ref,
) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
    } catch {
      return; /* clipboard unavailable */
    }
    setCopied(true);
    onCopy?.(codes);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([codes.join("\n") + "\n"], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    onDownload?.(codes);
  };
  const printCodes = () => {
    printRecoveryCodes(codes, typeof title === "string" ? title : undefined);
    onPrint?.(codes);
  };
  const icon = (name: string) => (icons ? <Webicon name={name} bare fallback="iconify" /> : null);
  return (
    <div ref={ref} className={cx("oc-recovery-codes", className)} {...rest}>
      <h3 className="oc-recovery-codes-title">{title}</h3>
      <p className="oc-recovery-codes-warning">
        {icon("mdi:alert-outline")}
        <span>{warning}</span>
      </p>
      <ul className="oc-recovery-codes-list">
        {codes.map((code) => <li key={code}>{code}</li>)}
      </ul>
      <div className="oc-recovery-codes-actions">
        <button className={cx("oc-btn oc-btn--outline oc-btn--sm", copied && "is-copied")} type="button" onClick={copy}>
          {icon(copied ? "mdi:check" : "mdi:content-copy")}
          {copied ? copiedLabel : copyLabel}
        </button>
        <button className="oc-btn oc-btn--outline oc-btn--sm" type="button" onClick={download}>
          {icon("mdi:download")}
          {downloadLabel}
        </button>
        {print && (
          <button className="oc-btn oc-btn--outline oc-btn--sm" type="button" onClick={printCodes}>
            {icon("mdi:printer")}
            {printLabel}
          </button>
        )}
      </div>
      <span className="oc-recovery-codes-status oc-visually-hidden" role="status" aria-live="polite">{copied ? copiedLabel : ""}</span>
    </div>
  );
});
