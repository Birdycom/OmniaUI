// File: packages/react/src/components/Webicon.tsx
// Map: props -> registry lookup (re-renders after registerWebicons / addWebicons) -> inline <svg> (viewBox, currentColor,
//      oc-icon + size, label = role img + title) | fallback (nothing, or <iconify-icon> for apps with the Iconify runtime)
// A webicon by name ("mdi:home", "flag:nl-4x3") as inline SVG, from icons the app registered (no network).
"use client";

import { createElement, forwardRef, useId, useSyncExternalStore } from "react";
import type { CSSProperties, ReactNode, SVGProps } from "react";
import { cx } from "../utils";
import { getWebicon, hasIconifyRuntime, subscribeWebicons, warnOnce, webiconSvg, webiconsVersion } from "../webicons";

export { addWebicons, getWebicon, hasWebicon, languageFlag, registerWebicons } from "../webicons";
export type { ResolvedWebicon, WebiconData, WebiconMap, WebiconSet } from "../webicons";

export type WebiconSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface WebiconProps extends Omit<SVGProps<SVGSVGElement>, "name" | "children"> {
  /** Full name: set prefix + icon ("mdi:home", "material-symbols:arrow-outward-rounded", "flag:nl-4x3"). */
  name: string;
  /** Fixed size: xs 0.875rem, sm 1rem, md 1.25rem, lg 1.5rem, xl 2rem. Without it the icon is 1.25em (follows the text). */
  size?: WebiconSize;
  /** Accessible name: the icon becomes role="img" with a <title>. Without it the icon is decorative (aria-hidden). */
  label?: string;
  /** No oc-icon class: 1em high like the Iconify element, for places that size the icon themselves. */
  bare?: boolean;
  /** An unregistered name: draw nothing (default) or an <iconify-icon> for apps that load the Iconify runtime. */
  fallback?: "none" | "iconify";
}

/** `svg.oc-icon[data-webicon]`: a webicon as inline SVG in currentColor. Register icons first (see registerWebicons). */
export const Webicon = forwardRef<SVGSVGElement, WebiconProps>(function Webicon(
  { name, size, label, bare = false, fallback = "none", className, style, ...rest },
  ref,
) {
  useSyncExternalStore(subscribeWebicons, webiconsVersion, webiconsVersion);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const icon = getWebicon(name);
  if (!icon) {
    if (fallback === "iconify") {
      if (!hasIconifyRuntime()) warnOnce(name);
      return createElement("iconify-icon", label ? { icon: name, role: "img", "aria-label": label, className } : { icon: name, "aria-hidden": "true", className });
    }
    warnOnce(name);
    return null;
  }
  const { viewBox, ratio, html } = webiconSvg(icon, label, uid);
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={`${ratio}em`}
      height="1em"
      fill="currentColor"
      className={cx(!bare && "oc-icon", !bare && size && `oc-icon--${size}`, className) || undefined}
      style={ratio !== 1 && !bare ? ({ "--oc-icon-ratio": ratio, ...style } as CSSProperties) : style}
      data-webicon={name}
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      focusable="false"
      {...rest}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});

/** @internal An icon prop of a component: a webicon name draws as inline SVG (or <iconify-icon> when the app only
 *  registered it with the Iconify runtime); any other node is drawn as it is. */
export function webiconNode(icon: unknown, label?: string): ReactNode {
  return typeof icon === "string" && icon.includes(":")
    ? <Webicon name={icon} bare fallback="iconify" label={label} />
    : (icon as ReactNode);
}
