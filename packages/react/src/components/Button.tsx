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
  /** Inside running text (with variant="link"): no padding or height, the size of the text around it. */
  inline?: boolean;
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

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleProps {}

/** `<button class="oc-btn oc-btn--{variant} oc-btn--{size}">` */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, icon, pill, inline, className, ...rest },
  ref,
) {
  return <button ref={ref} className={buttonClass({ variant, size, icon, pill, inline, className })} {...rest} />;
});

export interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement>, ButtonStyleProps {}

/** An anchor styled as a button. */
export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(function ButtonLink(
  { variant, size, icon, pill, inline, className, ...rest },
  ref,
) {
  return <a ref={ref} className={buttonClass({ variant, size, icon, pill, inline, className })} {...rest} />;
});
