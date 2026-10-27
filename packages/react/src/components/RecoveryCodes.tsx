"use client";

import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface RecoveryCodesProps extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "onCopy"> {
  codes: string[];
  title?: ReactNode;
  warning?: ReactNode;
  copyLabel?: string;
  downloadLabel?: string;
  /** File name of the download (default `recovery-codes.txt`). */
  fileName?: string;
  onCopy?: (codes: string[]) => void;
  onDownload?: (codes: string[]) => void;
}

/** `.oc-recovery-codes`: warning panel with a code grid, "Copy all" and "Download .txt". */
export const RecoveryCodes = forwardRef<HTMLDivElement, RecoveryCodesProps>(function RecoveryCodes(
  {
    codes,
    title = "Recovery codes",
    warning = "Store these codes somewhere safe. Each code works once.",
    copyLabel = "Copy all",
    downloadLabel = "Download .txt",
    fileName = "recovery-codes.txt",
    onCopy,
    onDownload,
    className,
    ...rest
  },
  ref,
) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
      onCopy?.(codes);
    } catch {
      /* clipboard unavailable */
    }
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
  return (
    <div ref={ref} className={cx("oc-recovery-codes", className)} {...rest}>
      <h3 className="oc-recovery-codes-title">{title}</h3>
      <p className="oc-recovery-codes-warning">{warning}</p>
      <ul className="oc-recovery-codes-list">
        {codes.map((code) => <li key={code}>{code}</li>)}
      </ul>
      <div className="oc-recovery-codes-actions">
        <button className="oc-btn oc-btn--outline oc-btn--sm" type="button" onClick={copy}>{copyLabel}</button>
        <button className="oc-btn oc-btn--outline oc-btn--sm" type="button" onClick={download}>{downloadLabel}</button>
      </div>
    </div>
  );
});
