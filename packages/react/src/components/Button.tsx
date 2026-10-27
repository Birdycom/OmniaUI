import { forwardRef } from "react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cx } from "../utils";

export type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "link" | "destructive" | "success" | "gradient" | "glass";
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
}

/** The class string of a button; reuse it on your own elements (router links etc.). */
export function buttonClass({ variant = "default", size = "md", icon, pill, className }: ButtonStyleProps & { className?: string }) {
  return cx(
    "oc-btn",
    variant !== "default" && `oc-btn--${variant}`,
    size !== "md" && `oc-btn--${size}`,
    icon && "oc-btn--icon",
    pill && "oc-btn--pill",
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleProps {}

/** `<button class="oc-btn oc-btn--{variant} oc-btn--{size}">` */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, icon, pill, className, ...rest },
  ref,
) {
  return <button ref={ref} className={buttonClass({ variant, size, icon, pill, className })} {...rest} />;
});

export interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement>, ButtonStyleProps {}

/** An anchor styled as a button. */
export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(function ButtonLink(
  { variant, size, icon, pill, className, ...rest },
  ref,
) {
  return <a ref={ref} className={buttonClass({ variant, size, icon, pill, className })} {...rest} />;
});
