import { cloneElement, createElement, forwardRef } from "react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ComponentPropsWithRef, CSSProperties, ElementType, ReactElement, ReactNode, RefAttributes } from "react";
import { cx } from "../utils";
import { mergeIntoChild } from "../asChild";
import { getWebicon, webiconSvg } from "../webicons";
import { Webicon } from "./Webicon";

export type ButtonVariant =
  | "default" | "secondary" | "outline" | "ghost" | "link" | "destructive" | "success" | "gradient" | "glass" | "neon"
  | "soft-primary" | "soft-success" | "soft-warning" | "soft-destructive" | "soft-info" | "plain";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

interface ButtonStyleProps {
  /** Visual variant (`default` = primary). */
  variant?: ButtonVariant;
  /** `md` is the default size and adds no class. */
  size?: ButtonSize;
  /** Square icon-only button. */
  icon?: boolean;
  /** Fully rounded pill shape. */
  pill?: boolean;
  /** Inside running text (with variant="link"): no padding or height, the size of the text around it. */
  inline?: boolean;
  /** 0.17.1: with variant="outline" or "ghost" on a dark or coloured band: the label, border and hover follow the text colour around it. */
  inherit?: boolean;
  /** 0.17.0: module colour (`data-module`): blue, green, purple, gold, cyan, pink, red, orange, teal, slate, or your own name. */
  module?: string;
  /**
   * 0.17.0: small icons rise behind the label (`.oc-btn--float`), e.g. on a Donate button. `"hearts"` (default heart) or a
   * webicon name (`"mdi:star"`; any other registered webicon works too). No animation with prefers-reduced-motion.
   */
  float?: "hearts" | (string & {});
}

interface LoadingProp {
  /** Busy: a spinner replaces the leading icon and the button cannot be clicked (`aria-busy`). */
  loading?: boolean;
}

/** The class string of a button; reuse it on your own elements (router links etc.). */
export function buttonClass({ variant = "default", size = "md", icon, pill, inline, inherit, float, className }: Omit<ButtonStyleProps, "module"> & { className?: string }) {
  return cx(
    "oc-btn",
    variant !== "default" && `oc-btn--${variant}`,
    size !== "md" && `oc-btn--${size}`,
    icon && "oc-btn--icon",
    pill && "oc-btn--pill",
    inline && "oc-btn--inline",
    inherit && "oc-btn--inherit",
    float && "oc-btn--float",
    className,
  );
}

interface ButtonIconProps {
  /** Icon before the label: a webicon name (`"mdi:plus"`) or any node. A `loading` spinner takes its place. */
  iconStart?: ReactNode;
  /** Icon after the label: a webicon name (`"mdi:arrow-right"`) or any node. */
  iconEnd?: ReactNode;
}

/** A webicon name becomes a Webicon; any other node stays as it is. */
const buttonIcon = (icon: ReactNode) => (typeof icon === "string" ? <Webicon name={icon} fallback="iconify" /> : icon);

const FLOAT_BUILT_IN = new Set(["hearts", "mdi:heart", "mdi:star"]);

/** @internal `float` -> root attributes (data-float-icon, data-module, the mask of another webicon) and the particle layer. */
function floatAndModule(float: string | undefined, module: string | undefined, style: CSSProperties | undefined) {
  const out: { "data-module"?: string; "data-float-icon"?: string; style?: CSSProperties } = {};
  if (module) out["data-module"] = module;
  out.style = style;
  if (!float) return { attrs: out, layer: null };
  const name = float === "hearts" ? "mdi:heart" : float;
  out["data-float-icon"] = name;
  const icon = FLOAT_BUILT_IN.has(name) ? undefined : getWebicon(name);
  if (icon) {
    const { viewBox, html } = webiconSvg(icon);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${html}</svg>`;
    out.style = { "--oc-btn-float-icon": `url("data:image/svg+xml,${encodeURIComponent(svg)}")`, ...style } as CSSProperties;
  }
  return { attrs: out, layer: <span className="oc-btn-float" aria-hidden="true"><i /><i /><i /><i /><i /></span> };
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleProps, LoadingProp, ButtonIconProps {
  /**
   * 0.17.2: put the button classes and props on your only child instead of a `<button>` (`<Button asChild><Link to="/x">Open</Link></Button>`).
   * Handlers are chained, classes joined; disabled/loading become `aria-disabled` on a non-button child. `as` keeps working.
   */
  asChild?: boolean;
}

/** Props of `<Button as={…}>`: the button props plus those of the element or component it renders. */
export type ButtonAsProps<E extends ElementType> = ButtonStyleProps & LoadingProp & ButtonIconProps & {
  /** Render this element or component with the button classes: `"a"`, `"span"`, a router link … */
  as: E;
  /** Not clickable: `aria-disabled="true"` (a native `disabled` only exists on a button). */
  disabled?: boolean;
} & Omit<ComponentPropsWithRef<E>, keyof ButtonStyleProps | keyof LoadingProp | keyof ButtonIconProps | "as" | "disabled">;

export interface ButtonComponent {
  (props: ButtonProps & RefAttributes<HTMLButtonElement>): ReactElement | null;
  <E extends ElementType>(props: ButtonAsProps<E>): ReactElement | null;
  displayName?: string;
}

/**
 * `<button class="oc-btn oc-btn--{variant} oc-btn--{size}">`. With `as` it renders that element or component instead
 * (`as="a" href=…`, `as={Link} to=…`); disabled/loading then become `aria-disabled`.
 * `asChild` (0.17.2) merges the button classes and props into your only child instead (Radix-style).
 */
export const Button = forwardRef<HTMLElement, ButtonProps & { as?: ElementType }>(function Button(
  { as, asChild, variant, size, icon, pill, inline, inherit, module, float, loading, disabled, iconStart, iconEnd, className, style, children, ...rest },
  ref,
) {
  if (asChild) {
    const off = disabled || loading;
    const extra = floatAndModule(float, module, style);
    const merged = mergeIntoChild(children, {
      className: buttonClass({ variant, size, icon, pill, inline, inherit, float, className }), "aria-busy": loading || undefined,
      ...extra.attrs, ...(off ? { "aria-disabled": true } : {}), ...rest,
    }, ref);
    if (!merged) return null;
    if (!extra.layer && iconStart == null && iconEnd == null) return merged;
    const inner = (merged.props as { children?: ReactNode }).children;
    return cloneElement(merged, undefined, extra.layer, buttonIcon(iconStart), inner, buttonIcon(iconEnd));
  }
  const Tag: ElementType = as ?? "button";
  const off = disabled || loading;
  const state = Tag === "button" ? { disabled: off } : off ? { "aria-disabled": true } : {};
  const extra = floatAndModule(float, module, style);
  return createElement(
    Tag,
    { ref, className: buttonClass({ variant, size, icon, pill, inline, inherit, float, className }), "aria-busy": loading || undefined, ...extra.attrs, ...state, ...rest },
    extra.layer,
    buttonIcon(iconStart),
    children,
    buttonIcon(iconEnd),
  );
}) as unknown as ButtonComponent;

export interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement>, ButtonStyleProps, LoadingProp, ButtonIconProps {}

/** An anchor styled as a button. */
export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(function ButtonLink(
  { variant, size, icon, pill, inline, inherit, module, float, loading, iconStart, iconEnd, className, style, children, ...rest },
  ref,
) {
  const extra = floatAndModule(float, module, style);
  return (
    <a ref={ref} className={buttonClass({ variant, size, icon, pill, inline, inherit, float, className })} aria-busy={loading || undefined} {...extra.attrs} {...rest}>
      {extra.layer}
      {buttonIcon(iconStart)}
      {children}
      {buttonIcon(iconEnd)}
    </a>
  );
});
