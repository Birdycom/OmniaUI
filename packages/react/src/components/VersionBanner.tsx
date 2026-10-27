// File: packages/react/src/components/VersionBanner.tsx
// Map: VersionBanner = chip (role=status) -> dot -> long text -> short text -> reload action
// Renders nothing while `version` is empty. Your app sets `version` when it sees a newer build.
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface VersionBannerProps extends HTMLAttributes<HTMLDivElement> {
  /** The new version, e.g. "v0.6.0". Empty = no banner. */
  version?: string | null;
  /** Long text; default "New version (vX) available - reload the page". */
  text?: ReactNode;
  /** Short text below 40rem; default "New version". */
  short?: ReactNode;
  actionLabel?: ReactNode;
  /** Custom reload; without it the action is a plain link to the current page. */
  onReload?: () => void;
  tone?: "warning" | "info" | "success";
  floating?: boolean;
}

/** `.oc-version-banner`: "new version available - reload" chip. */
export const VersionBanner = forwardRef<HTMLDivElement, VersionBannerProps>(function VersionBanner(
  { version, text, short = "New version", actionLabel = "Reload", onReload, tone = "warning", floating, className, ...rest },
  ref,
) {
  if (!version) return null;
  const cls = cx("oc-version-banner", tone !== "warning" && `oc-version-banner--${tone}`, floating && "oc-version-banner--floating", className);
  return (
    <div ref={ref} className={cls} role="status" {...rest}>
      <span className="oc-version-banner-dot" aria-hidden="true" />
      <span className="oc-version-banner-text">{text ?? `New version (${version}) available - reload the page`}</span>
      <span className="oc-version-banner-short">{short}</span>
      {onReload ? (
        <button className="oc-version-banner-action" type="button" onClick={onReload}>{actionLabel}</button>
      ) : (
        <a className="oc-version-banner-action" href="">{actionLabel}</a>
      )}
    </div>
  );
});
