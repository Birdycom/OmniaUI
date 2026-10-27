"use client";

import { forwardRef } from "react";
import type { AnchorHTMLAttributes, HTMLAttributes, LiHTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";

export interface SidebarProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Icon-only mode. */
  collapsed?: boolean;
  /** Dock on the right. */
  right?: boolean;
  /** Floating card look. */
  floating?: boolean;
  /** Dark panel that stays dark in the light theme (`--dark`). */
  dark?: boolean;
  /** Fixed top area (logo, workspace switcher). */
  header?: ReactNode;
  /** Fixed bottom area (user). */
  footer?: ReactNode;
}

/** `<aside class="oc-sidebar">`: children go in the scrolling `oc-sidebar-content`. */
export const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  { collapsed, right, floating, dark, header, footer, className, children, ...rest },
  ref,
) {
  return (
    <aside
      ref={ref}
      className={cx("oc-sidebar", collapsed && "oc-sidebar--collapsed", right && "oc-sidebar--right", floating && "oc-sidebar--floating", dark && "oc-sidebar--dark", className)}
      {...rest}
    >
      {header != null && <div className="oc-sidebar-header">{header}</div>}
      <div className="oc-sidebar-content">{children}</div>
      {footer != null && <div className="oc-sidebar-footer">{footer}</div>}
    </aside>
  );
});

export interface SidebarGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Group heading (`oc-sidebar-group-label`). */
  label?: ReactNode;
}

/** `.oc-sidebar-group` with an optional label. */
export const SidebarGroup = forwardRef<HTMLDivElement, SidebarGroupProps>(function SidebarGroup(
  { label, className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx("oc-sidebar-group", className)} {...rest}>
      {label != null && <div className="oc-sidebar-group-label">{label}</div>}
      {children}
    </div>
  );
});

/** `.oc-sidebar-separator` */
export function SidebarSeparator({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("oc-sidebar-separator", className)} {...rest} />;
}

/** `ul.oc-sidebar-menu` */
export const SidebarMenu = forwardRef<HTMLUListElement, HTMLAttributes<HTMLUListElement>>(function SidebarMenu(
  { className, ...rest },
  ref,
) {
  return <ul ref={ref} className={cx("oc-sidebar-menu", className)} {...rest} />;
});

/** `<li>` of a sidebar menu. */
export function SidebarMenuItem(props: LiHTMLAttributes<HTMLLIElement>) {
  return <li {...props} />;
}

export interface SidebarMenuButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Inline SVG icon (`oc-sidebar-menu-icon`). */
  icon?: ReactNode;
  /** Count pill on the right. */
  badge?: ReactNode;
  /** Current page (`aria-current="page"`). */
  current?: boolean;
  disabled?: boolean;
  size?: "md" | "lg";
  /** Wrap the children in `oc-sidebar-menu-label` (hidden when collapsed). Default true. */
  label?: boolean;
}

/** `.oc-sidebar-menu-button`: a link (or button when no `href`). */
export const SidebarMenuButton = forwardRef<HTMLAnchorElement, SidebarMenuButtonProps>(function SidebarMenuButton(
  { icon, badge, current, disabled, size = "md", label = true, className, children, href, ...rest },
  ref,
) {
  const content = (
    <>
      {icon}
      {label ? <span className="oc-sidebar-menu-label">{children}</span> : children}
      {badge != null && <span className="oc-sidebar-menu-badge">{badge}</span>}
    </>
  );
  const props = {
    className: cx("oc-sidebar-menu-button", size === "lg" && "oc-sidebar-menu-button--lg", className),
    "aria-current": current ? ("page" as const) : undefined,
    "aria-disabled": disabled ? true : undefined,
  };
  if (href === undefined) {
    return <button type="button" {...props} {...(rest as object)}>{content}</button>;
  }
  return <a ref={ref} href={href} {...props} {...rest}>{content}</a>;
});

export interface SidebarCollapsibleProps extends Omit<HTMLAttributes<HTMLDetailsElement>, "title" | "onToggle"> {
  icon?: ReactNode;
  /** Summary label. */
  label: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** `details.oc-sidebar-collapsible`: children are the `<li>` items of the nested `oc-sidebar-menu-sub`. */
export const SidebarCollapsible = forwardRef<HTMLDetailsElement, SidebarCollapsibleProps>(function SidebarCollapsible(
  { icon, label, open, defaultOpen, onOpenChange, className, children, ...rest },
  ref,
) {
  const [isOpen, setOpen] = useControllable<boolean>(open, defaultOpen ?? false, onOpenChange);
  return (
    <details
      ref={ref}
      className={cx("oc-sidebar-collapsible", className)}
      open={isOpen}
      onToggle={(e) => {
        if (e.currentTarget.open !== isOpen) setOpen(e.currentTarget.open);
      }}
      {...rest}
    >
      <summary className="oc-sidebar-menu-button">
        {icon}
        <span className="oc-sidebar-menu-label">{label}</span>
      </summary>
      <ul className="oc-sidebar-menu-sub">{children}</ul>
    </details>
  );
});
