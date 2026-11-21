// File: packages/react/src/components/Sidebar.tsx
// Map: provider (state, persist, mobile breakpoint, shortcut) + useSidebar -> Sidebar (reads the provider) -> trigger, rail,
//      inset -> group, separator, menu (+ sub), item, button, action, badge, collapsible
"use client";

import { createContext, forwardRef, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, LiHTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { useControllable } from "../hooks";
import { Webicon } from "./Webicon";

/* ---------------------------------------------------------------- provider (0.17.0) */

export interface SidebarContextValue {
  /** The sidebar shows icons only (desktop) or is closed (mobile). */
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggle: () => void;
  /** Below the mobile breakpoint: the sidebar opens over the page (overlay). */
  isMobile: boolean;
  /** Mobile: the overlay is open. */
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

/** The sidebar state of the nearest SidebarProvider (throws outside one). */
export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used inside <SidebarProvider>.");
  return ctx;
}

/** The sidebar state, or null outside a SidebarProvider. */
export function useSidebarOptional(): SidebarContextValue | null {
  return useContext(SidebarContext);
}

/** Storage keys: localStorage `oc-sidebar:<key>`, cookie `oc-sidebar-<key>` ("1" = collapsed, "0" = open). */
export function sidebarStorageKey(persist: string | boolean | undefined, storage: "local" | "cookie" = "local"): string | null {
  if (!persist) return null;
  const key = persist === true ? "default" : persist;
  return storage === "cookie" ? `oc-sidebar-${key}` : `oc-sidebar:${key}`;
}

function readPersisted(name: string | null, storage: "local" | "cookie"): boolean | undefined {
  if (!name || typeof document === "undefined") return undefined;
  try {
    const raw = storage === "cookie"
      ? document.cookie.split("; ").find((c) => c.startsWith(`${name}=`))?.slice(name.length + 1)
      : window.localStorage.getItem(name);
    return raw === "1" ? true : raw === "0" ? false : undefined;
  } catch {
    return undefined;
  }
}

function writePersisted(name: string | null, storage: "local" | "cookie", collapsed: boolean) {
  if (!name || typeof document === "undefined") return;
  try {
    if (storage === "cookie") document.cookie = `${name}=${collapsed ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
    else window.localStorage.setItem(name, collapsed ? "1" : "0");
  } catch {
    // Private mode can block storage: the sidebar still works for this visit.
  }
}

export interface SidebarProviderProps extends HTMLAttributes<HTMLDivElement> {
  /** Start collapsed (uncontrolled). Default false. */
  defaultCollapsed?: boolean;
  /** Collapsed (controlled). */
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Remember the desktop state: true or a key (several apps on one domain). */
  persist?: string | boolean;
  /** Where to remember it: localStorage (default) or a cookie the server can read to render the right state at once. */
  storage?: "local" | "cookie";
  /** Below this width (px) the sidebar opens over the page and starts closed. Default 768; 0 = never. */
  mobileBreakpoint?: number;
  /** Ctrl/Cmd + this key toggles the sidebar. Default "b"; false = no shortcut. */
  shortcut?: string | false;
}

/**
 * `div.oc-sidebar-provider`: holds the sidebar state for Sidebar, SidebarTrigger, SidebarRail and useSidebar(). A Sidebar
 * inside follows it unless it gets its own `collapsed`.
 */
export const SidebarProvider = forwardRef<HTMLDivElement, SidebarProviderProps>(function SidebarProvider(
  { defaultCollapsed = false, collapsed, onCollapsedChange, persist, storage = "local", mobileBreakpoint = 768, shortcut = "b", className, children, ...rest },
  ref,
) {
  const storeName = sidebarStorageKey(persist, storage);
  const [desktop, setDesktop] = useControllable<boolean>(collapsed, defaultCollapsed, onCollapsedChange);
  const [isMobile, setIsMobile] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);

  // The remembered state, after mounting (the server render uses the default, or a cookie the app read itself).
  useEffect(() => {
    if (collapsed !== undefined) return;
    const saved = readPersisted(storeName, storage);
    if (saved !== undefined && saved !== desktop) setDesktop(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeName, storage]);

  useEffect(() => {
    if (!mobileBreakpoint || typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia(`(max-width: ${mobileBreakpoint - 0.02}px)`);
    const update = () => {
      setIsMobile(mq.matches);
      setOpenMobile(false);
    };
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, [mobileBreakpoint]);

  const setCollapsed = useCallback(
    (next: boolean) => {
      if (isMobile) {
        setOpenMobile(!next);
        return;
      }
      writePersisted(storeName, storage, next);
      setDesktop(next);
    },
    [isMobile, storeName, storage, setDesktop],
  );
  const current = isMobile ? !openMobile : desktop;
  const toggle = useCallback(() => setCollapsed(!current), [setCollapsed, current]);

  useEffect(() => {
    if (!shortcut) return;
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || e.key.toLowerCase() !== shortcut.toLowerCase()) return;
      if ((e.target as HTMLElement | null)?.isContentEditable) return;
      e.preventDefault();
      toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcut, toggle]);

  const value = useMemo<SidebarContextValue>(
    () => ({ collapsed: current, setCollapsed, toggle, isMobile, openMobile, setOpenMobile }),
    [current, setCollapsed, toggle, isMobile, openMobile],
  );
  return (
    <SidebarContext.Provider value={value}>
      <div
        ref={ref}
        className={cx("oc-sidebar-provider", className)}
        data-state={current ? "collapsed" : "expanded"}
        data-mobile={isMobile ? "" : undefined}
        {...rest}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
});

export interface SidebarTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible name. Default "Toggle sidebar". */
  label?: string;
  /** Webicon name. Default "mdi:menu". */
  icon?: string;
}

/** `button.oc-sidebar-trigger`: opens or collapses the sidebar of the SidebarProvider. */
export const SidebarTrigger = forwardRef<HTMLButtonElement, SidebarTriggerProps>(function SidebarTrigger(
  { label = "Toggle sidebar", icon = "mdi:menu", className, children, onClick, ...rest },
  ref,
) {
  const ctx = useSidebarOptional();
  return (
    <button
      ref={ref}
      type="button"
      className={cx("oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm oc-sidebar-trigger", className)}
      aria-label={label}
      title={label}
      aria-expanded={ctx ? !ctx.collapsed : undefined}
      data-oc-sidebar-trigger=""
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) ctx?.toggle();
      }}
      {...rest}
    >
      {children ?? <Webicon name={icon} />}
    </button>
  );
});

export interface SidebarRailProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible name. Default "Toggle sidebar". */
  label?: string;
}

/** `button.oc-sidebar-rail`: a thin hit area on the edge of the sidebar that toggles it. Put it right after the Sidebar. */
export const SidebarRail = forwardRef<HTMLButtonElement, SidebarRailProps>(function SidebarRail(
  { label = "Toggle sidebar", className, onClick, ...rest },
  ref,
) {
  const ctx = useSidebarOptional();
  return (
    <button
      ref={ref}
      type="button"
      tabIndex={-1}
      className={cx("oc-sidebar-rail", className)}
      aria-label={label}
      title={label}
      data-oc-sidebar-rail=""
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) ctx?.toggle();
      }}
      {...rest}
    />
  );
});

/** `main.oc-sidebar-inset`: the page next to the sidebar; it takes the remaining width (min-inline-size 0). */
export const SidebarInset = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function SidebarInset(
  { className, ...rest },
  ref,
) {
  return <main ref={ref} className={cx("oc-sidebar-inset", className)} {...rest} />;
});

/* ---------------------------------------------------------------- sidebar */

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
  { collapsed: collapsedProp, right, floating, dark, header, footer, overlay: overlayProp, onCollapsedChange: onCollapsedProp, variant = "app", title, className, children, ...rest },
  ref,
) {
  // Inside a SidebarProvider the sidebar follows it; its own props win (0.17.0).
  const ctx = useSidebarOptional();
  const collapsed = collapsedProp ?? ctx?.collapsed;
  const overlay = overlayProp ?? (ctx?.isMobile || undefined);
  const onCollapsedChange = onCollapsedProp ?? ctx?.setCollapsed;
  const open = overlay && !collapsed;
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCollapsedChange?.(true); };
    const onDown = (e: PointerEvent) => {
      const target = e.target as Element | null;
      // The trigger and the rail toggle it themselves.
      if (target?.closest?.(".oc-sidebar--overlay") || target?.closest?.("[data-oc-sidebar-trigger], [data-oc-sidebar-rail]")) return;
      onCollapsedChange?.(true);
    };
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

/** `ul.oc-sidebar-menu-sub`: the nested list under a parent link (the same as `<SidebarMenu sub>`). */
export const SidebarMenuSub = forwardRef<HTMLUListElement, HTMLAttributes<HTMLUListElement>>(function SidebarMenuSub(props, ref) {
  return <SidebarMenu ref={ref} sub {...props} />;
});

/** `<li>` of a sidebar menu. */
export function SidebarMenuItem(props: LiHTMLAttributes<HTMLLIElement>) {
  return <li {...props} />;
}

export interface SidebarMenuActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible name (also the tooltip). */
  label: string;
  /** Webicon name, e.g. "mdi:dots-vertical" (default) or "mdi:plus". */
  icon?: string;
  /** Only visible while the item is hovered or has focus. */
  showOnHover?: boolean;
}

/** `button.oc-sidebar-menu-action`: a small button on the right of a menu item (more, add …); put it in the SidebarMenuItem. */
export const SidebarMenuAction = forwardRef<HTMLButtonElement, SidebarMenuActionProps>(function SidebarMenuAction(
  { label, icon = "mdi:dots-vertical", showOnHover, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cx("oc-sidebar-menu-action", showOnHover && "oc-sidebar-menu-action--hover", className)}
      aria-label={label}
      title={label}
      {...rest}
    >
      {children ?? <Webicon name={icon} />}
    </button>
  );
});

/** `span.oc-sidebar-menu-badge`: the count pill of a menu button (the same as its `badge` prop). */
export function SidebarMenuBadge({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cx("oc-sidebar-menu-badge", className)} {...rest} />;
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
