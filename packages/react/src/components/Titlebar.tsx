// File: packages/react/src/components/Titlebar.tsx
// Map: types -> TitlebarWindow (column, shared scroll timeline) -> Titlebar (main: icon, title, subtitle | actions: children)
//      -> TitlebarButton (icon button, --close) -> TitlebarBody (scrolls; the bar gets its hairline)
import { forwardRef } from "react";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";

/** `.oc-titlebar-window`: wraps Titlebar + TitlebarBody so the bar sees the body scroll. */
export const TitlebarWindow = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function TitlebarWindow({ className, ...rest }, ref) {
  return <div ref={ref} className={cx("oc-titlebar-window", className)} {...rest} />;
});

export interface TitlebarProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: ReactNode;
  /** Muted text after a ·, cuts off with …. */
  subtitle?: ReactNode;
  /** An app icon or logo before the title. */
  icon?: ReactNode;
  /** Hairline all the time (no scrolling body). */
  bordered?: boolean;
  size?: "sm" | "md";
  /** The action buttons (TitlebarButton). */
  children?: ReactNode;
}

/** `<header class="oc-titlebar">`: drag area of a frameless window; the buttons stay clickable. */
export const Titlebar = forwardRef<HTMLElement, TitlebarProps>(function Titlebar(
  { title, subtitle, icon, bordered, size = "md", className, children, ...rest },
  ref,
) {
  return (
    <header ref={ref} className={cx("oc-titlebar", bordered && "oc-titlebar--bordered", size === "sm" && "oc-titlebar--sm", className)} {...rest}>
      <div className="oc-titlebar__main">
        {icon != null && <span className="oc-titlebar__icon" aria-hidden="true">{icon}</span>}
        {title != null && <span className="oc-titlebar__title">{title}</span>}
        {subtitle != null && <span className="oc-titlebar__subtitle">{subtitle}</span>}
      </div>
      {children != null && <div className="oc-titlebar__actions">{children}</div>}
    </header>
  );
});

export interface TitlebarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** The button's name for screen readers (icon-only button). */
  label: string;
  /** Red on hover. */
  close?: boolean;
}

/** `<button class="oc-titlebar__btn">`: compact icon button in the title bar. */
export const TitlebarButton = forwardRef<HTMLButtonElement, TitlebarButtonProps>(function TitlebarButton(
  { label, close, className, type = "button", ...rest },
  ref,
) {
  return <button ref={ref} type={type} aria-label={label} title={label} className={cx("oc-titlebar__btn", close && "oc-titlebar__btn--close", className)} {...rest} />;
});

/** `.oc-titlebar-body`: the part of the window that scrolls. */
export const TitlebarBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function TitlebarBody({ className, ...rest }, ref) {
  return <div ref={ref} className={cx("oc-titlebar-body", className)} {...rest} />;
});
