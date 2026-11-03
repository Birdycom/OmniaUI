// Same markup as packages/ui/snippets/brand-mark.html.
import { forwardRef } from "react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface BrandMarkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** The mark: an <svg className="oc-brand-mark__icon"> or <img className="oc-brand-mark__icon">. */
  icon?: ReactNode;
  /** The name before the accent part. */
  name: ReactNode;
  /** Part of the name in the brand gradient. */
  accent?: ReactNode;
  tagline?: ReactNode;
  size?: "sm" | "md" | "lg";
}

/** Logo from an icon and text (`.oc-brand-mark`): word mark with a gradient part and a tagline. */
export const BrandMark = forwardRef<HTMLAnchorElement, BrandMarkProps>(function BrandMark(
  { icon, name, accent, tagline, size = "md", className, ...rest },
  ref,
) {
  return (
    <a ref={ref} className={cx("oc-brand-mark", size !== "md" && `oc-brand-mark--${size}`, className)} {...rest}>
      {icon}
      <span className="oc-brand-mark__text">
        <span className="oc-brand-mark__word">{name}{accent != null && <span className="oc-brand-mark__accent">{accent}</span>}</span>
        {tagline != null && <span className="oc-brand-mark__tagline">{tagline}</span>}
      </span>
    </a>
  );
});
