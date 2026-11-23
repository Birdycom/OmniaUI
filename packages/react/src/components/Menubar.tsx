// File: packages/react/src/components/Menubar.tsx
// Map: menu entries (action, check, separator, heading, sub-menu) -> MenuEntries renderer (shared with ContextMenu) ->
//      MenuPanel (popover, autofocus, arrow keys) -> Menubar (bar of triggers + one popover menu each)
// Same markup as packages/ui/snippets/menubar.html.
"use client";

import { Fragment, forwardRef, useId, useRef } from "react";
import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { attrs, cx } from "../utils";
import { closeMenuOf, handleMenuKeyDown, useMenuAutofocus, useMergedRef } from "../hooks";

export interface MenuAction {
  label: ReactNode;
  /** Muted shortcut on the right (`.oc-dropdown-shortcut`, "Ctrl T"). */
  shortcut?: ReactNode;
  /** A check item (role menuitemcheckbox): true or false. It keeps the menu open. */
  checked?: boolean;
  /** Red item (`oc-dropdown-item--destructive`). */
  destructive?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  /** A sub-menu (`.oc-dropdown-sub` > `.oc-dropdown-submenu`). */
  items?: MenuEntry[];
}

export type MenuEntry = MenuAction | { separator: true } | { heading: ReactNode };

/** The items of an `.oc-dropdown-menu[role=menu]` from data (used by Menubar and ContextMenu). */
export function MenuEntries({ items }: { items: MenuEntry[] }) {
  return (
    <>
      {items.map((entry, i) => {
        if ("separator" in entry) return <div key={i} className="oc-dropdown-separator" role="separator"></div>;
        if ("heading" in entry) return <div key={i} className="oc-dropdown-label">{entry.heading}</div>;
        if (entry.items) {
          return (
            <div key={i} className="oc-dropdown-sub">
              <button className="oc-dropdown-item" type="button" role="menuitem" aria-haspopup="menu" disabled={entry.disabled}>{entry.label}</button>
              <div className="oc-dropdown-submenu" role="menu"><MenuEntries items={entry.items} /></div>
            </div>
          );
        }
        const check = entry.checked !== undefined;
        return (
          <button
            key={i}
            className={cx("oc-dropdown-item", entry.destructive && "oc-dropdown-item--destructive")}
            type="button"
            role={check ? "menuitemcheckbox" : "menuitem"}
            aria-checked={check ? (entry.checked ? "true" : "false") : undefined}
            disabled={entry.disabled}
            onClick={(e) => {
              entry.onSelect?.();
              if (!check) closeMenuOf(e.currentTarget);
            }}
          >
            {entry.shortcut != null ? <Fragment>{entry.label} <span className="oc-dropdown-shortcut">{entry.shortcut}</span></Fragment> : entry.label}
          </button>
        );
      })}
    </>
  );
}

export interface MenuPanelProps extends HTMLAttributes<HTMLDivElement> {
  items?: MenuEntry[];
}

/** `.oc-dropdown-menu[popover][role=menu]` with arrow keys and focus on the first item when it opens. */
export const MenuPanel = forwardRef<HTMLDivElement, MenuPanelProps>(function MenuPanel({ items, className, children, onKeyDown, ...rest }, forwardedRef) {
  const inner = useRef<HTMLDivElement>(null);
  const ref = useMergedRef(inner, forwardedRef);
  useMenuAutofocus(inner);
  return (
    <div
      ref={ref}
      className={cx("oc-dropdown-menu", className)}
      {...attrs({ popover: "" })}
      role="menu"
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (!e.defaultPrevented) handleMenuKeyDown(e);
      }}
      {...rest}
    >
      {items && <MenuEntries items={items} />}
      {children}
    </div>
  );
});

export interface MenubarMenu {
  /** Text of the trigger in the bar. */
  label: ReactNode;
  items?: MenuEntry[];
  /** Own menu content instead of `items`. */
  content?: ReactNode;
  id?: string;
}

export interface MenubarProps extends HTMLAttributes<HTMLDivElement> {
  menus: MenubarMenu[];
  /** Accessible name of the bar (aria-label). */
  label?: string;
}

/** Horizontal menu bar (`.oc-menubar`, role="menubar") with one popover dropdown menu per trigger. ArrowLeft / Right move along the bar. */
export const Menubar = forwardRef<HTMLDivElement, MenubarProps>(function Menubar({ menus, label, className, onKeyDown, ...rest }, ref) {
  const auto = useId().replace(/:/g, "");
  const ids = menus.map((m, i) => m.id ?? `oc-menubar-${auto}-${i + 1}`);
  const onBarKey = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const triggers = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(".oc-menubar-trigger"));
    const at = triggers.indexOf(e.target as HTMLElement);
    if (at < 0) return;
    e.preventDefault();
    triggers[(at + (e.key === "ArrowRight" ? 1 : -1) + triggers.length) % triggers.length]?.focus();
  };
  return (
    <>
      <div ref={ref} className={cx("oc-menubar", className)} role="menubar" aria-label={label} onKeyDown={onBarKey} {...rest}>
        {menus.map((m, i) => (
          <button key={ids[i]} className="oc-menubar-trigger" type="button" role="menuitem" popoverTarget={ids[i]} aria-haspopup="menu">{m.label}</button>
        ))}
      </div>
      {menus.map((m, i) => (
        <MenuPanel key={ids[i]} id={ids[i]} items={m.items}>{m.content}</MenuPanel>
      ))}
    </>
  );
});
