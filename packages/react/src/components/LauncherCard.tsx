import { forwardRef } from "react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

export interface LauncherCardProps extends Omit<AnchorHTMLAttributes<HTMLElement>, "title"> {
  /** Tinted icon tile content (inline SVG). */
  icon?: ReactNode;
  title: ReactNode;
  /** Trailing badge inside the title. */
  badge?: ReactNode;
  description?: ReactNode;
  /** Footer text, e.g. why the card is disabled. */
  footer?: ReactNode;
  /** Current card (`aria-current="true"`). */
  active?: boolean;
  /** Not clickable (`aria-disabled`); renders a <span>. */
  disabled?: boolean;
}

/** `.oc-launcher`: an `<a>` (with `href`), a `<button>` (with `onClick`), or a `<span>` when disabled. */
export const LauncherCard = forwardRef<HTMLElement, LauncherCardProps>(function LauncherCard(
  { icon, title, badge, description, footer, active, disabled, className, href, onClick, ...rest },
  ref,
) {
  const content = (
    <>
      {icon != null && <span className="oc-launcher-icon" aria-hidden="true">{icon}</span>}
      <h3 className="oc-launcher-title">{title}{badge != null && <> {badge}</>}</h3>
      {description != null && <p className="oc-launcher-description">{description}</p>}
      {footer != null && <span className="oc-launcher-footer">{footer}</span>}
    </>
  );
  const cls = cx("oc-launcher", className);
  const common = { className: cls, "aria-current": active ? ("true" as const) : undefined };
  if (disabled) {
    return <span ref={ref} {...common} aria-disabled="true">{content}</span>;
  }
  if (href === undefined && onClick) {
    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} type="button" {...common} onClick={onClick as never}>
        {content}
      </button>
    );
  }
  return (
    <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} {...common} onClick={onClick} {...rest}>
      {content}
    </a>
  );
});
