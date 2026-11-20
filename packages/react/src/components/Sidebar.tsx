"use client";

import { createContext, forwardRef, useContext, useEffect } from "react";
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
  /** Open over the content instead of next to it (a tablet): the page darkens; a click outside or Escape collapses it. */
  overlay?: boolean;
  /** Called when the overlay asks to collapse (a click outside, Escape). */
  onCollapsedChange?: (collapsed: boolean) => void;
  /**
   * app (default): the panel with header, scrolling content and footer. docs (0.17.0): the documentation navigation
   * (`nav.oc-sidebar.oc-sidebar--docs`): an optional title, then groups of text links as plain siblings, no wrappers.
   */
  variant?: "app" | "docs";
  /** Docs variant: the heading on top (`h2.oc-sidebar-title`). */
  title?: ReactNode;
}

/** Which sidebar the parts sit in: the docs variant drops the wrappers, labels and tooltips of the app sidebar. */
const SidebarVariantContext = createContext<"app" | "docs">("app");

/** `<aside class="oc-sidebar">`: children go in the scrolling `oc-sidebar-content`. */
export const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  { collapsed, right, floating, dark, header, footer, overlay, onCollapsedChange, variant = "app", title, className, children, ...rest },
  ref,
) {
  const open = overlay && !collapsed;
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCollapsedChange?.(true); };
    const onDown = (e: PointerEvent) => { if (!(e.target as Element | null)?.closest?.(".oc-sidebar--overlay")) onCollapsedChange?.(true); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onDown); };
  }, [open, onCollapsedChange]);
  if (variant === "docs") {
    return (
      <SidebarVariantContext.Provider value="docs">
        <nav ref={ref} className={cx("oc-sidebar oc-sidebar--docs", collapsed && "oc-sidebar--collapsed", className)} {...rest}>
          {title != null && <h2 className="oc-sidebar-title">{title}</h2>}
          {children}
        </nav>
      </SidebarVariantContext.Provider>
    );
  }
  return (
    <aside
      ref={ref}
      className={cx("oc-sidebar", collapsed && "oc-sidebar--collapsed", right && "oc-sidebar--right", floating && "oc-sidebar--floating", dark && "oc-sidebar--dark", overlay && "oc-sidebar--overlay", className)}
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

/** `.oc-sidebar-group` with an optional label. In the docs sidebar: a `p.oc-sidebar-group-label` followed by the children, no wrapper. */
export const SidebarGroup = forwardRef<HTMLDivElement, SidebarGroupProps>(function SidebarGroup(
  { label, className, children, ...rest },
  ref,
) {
  const docs = useContext(SidebarVariantContext) === "docs";
  if (docs) {
    return (
      <>
        {label != null && <p className={cx("oc-sidebar-group-label", className)} {...(rest as HTMLAttributes<HTMLParagraphElement>)}>{label}</p>}
        {children}
      </>
    );
  }
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

export interface SidebarMenuProps extends HTMLAttributes<HTMLUListElement> {
  /** The nested list under a parent link (`ul.oc-sidebar-menu-sub`), as in the docs sidebar. */
  sub?: boolean;
}

/** `ul.oc-sidebar-menu`, or `ul.oc-sidebar-menu-sub` with `sub`. */
export const SidebarMenu = forwardRef<HTMLUListElement, SidebarMenuProps>(function SidebarMenu(
  { sub, className, ...rest },
  ref,
) {
  return <ul ref={ref} className={cx(sub ? "oc-sidebar-menu-sub" : "oc-sidebar-menu", className)} {...rest} />;
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
  /** The section that holds the current page (`.is-active`): highlighted without announcing it as the current page. */
  active?: boolean;
  disabled?: boolean;
  size?: "md" | "lg";
  /** Wrap the children in `oc-sidebar-menu-label` (hidden when collapsed). Default true; false in the docs sidebar. */
  label?: boolean;
  /** Tooltip in the collapsed sidebar (default: the label when it is text; false: none; none in the docs sidebar). */
  tooltip?: string | false;
}

/** `.oc-sidebar-menu-button`: a link (or button when no `href`). */
export const SidebarMenuButton = forwardRef<HTMLAnchorElement, SidebarMenuButtonProps>(function SidebarMenuButton(
  { icon, badge, current, active, disabled, size = "md", label: labelProp, tooltip, className, children, href, ...rest },
  ref,
) {
  const docs = useContext(SidebarVariantContext) === "docs";
  const label = labelProp ?? !docs;
  const content = (
    <>
      {icon}
      {label ? <span className="oc-sidebar-menu-label">{children}</span> : children}
      {badge != null && <span className="oc-sidebar-menu-badge">{badge}</span>}
    </>
  );
  const tip = tooltip === false || (docs && tooltip === undefined) ? undefined : tooltip ?? (typeof children === "string" ? children : undefined);
  const props = {
    className: cx("oc-sidebar-menu-button", size === "lg" && "oc-sidebar-menu-button--lg", active && "is-active", tip && "oc-tooltip oc-tooltip--right", className),
    "data-tooltip": tip,
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
