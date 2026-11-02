import { forwardRef } from "react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cx } from "../utils";

export type ButtonVariant =
  | "default" | "secondary" | "outline" | "ghost" | "link" | "destructive" | "success" | "gradient" | "glass"
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
}

interface LoadingProp {
  /** Busy: a spinner replaces the leading icon and the button cannot be clicked (`aria-busy`). */
  loading?: boolean;
}

/** The class string of a button; reuse it on your own elements (router links etc.). */
export function buttonClass({ variant = "default", size = "md", icon, pill, inline, className }: ButtonStyleProps & { className?: string }) {
  return cx(
    "oc-btn",
    variant !== "default" && `oc-btn--${variant}`,
    size !== "md" && `oc-btn--${size}`,
    icon && "oc-btn--icon",
    pill && "oc-btn--pill",
    inline && "oc-btn--inline",
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleProps, LoadingProp {}

/** `<button class="oc-btn oc-btn--{variant} oc-btn--{size}">` */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, icon, pill, inline, loading, disabled, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={buttonClass({ variant, size, icon, pill, inline, className })}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      {...rest}
    />
  );
});

export interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement>, ButtonStyleProps, LoadingProp {}

/** An anchor styled as a button. */
export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(function ButtonLink(
  { variant, size, icon, pill, inline, loading, className, ...rest },
  ref,
) {
  return <a ref={ref} className={buttonClass({ variant, size, icon, pill, inline, className })} aria-busy={loading || undefined} {...rest} />;
});
