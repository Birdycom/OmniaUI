// File: packages/react/src/components/ContextMenu.tsx
// Map: props (items, menu label) -> area (.oc-context-area, right-click or menu key) -> position (--oc-context-x / -y)
//      -> showPopover (after the release in Firefox) -> menu (MenuPanel with .oc-context-menu)
// Same markup as packages/ui/snippets/context-menu.html.
"use client";

import { forwardRef, useId, useRef } from "react";
import type { HTMLAttributes, MouseEvent, ReactNode } from "react";
import { cx } from "../utils";
import { MenuPanel } from "./Menubar";
import type { MenuEntry } from "./Menubar";

export interface ContextMenuProps extends Omit<HTMLAttributes<HTMLDivElement>, "content"> {
  items?: MenuEntry[];
  /** Own menu content instead of `items`. */
  content?: ReactNode;
  /** Accessible name of the menu (default "Actions"). */
  menuLabel?: string;
  /** Id of the menu (default a generated one). */
  menuId?: string;
}

type PopoverEl = HTMLDivElement & { showPopover?: () => void };

/** Dropdown menu at the pointer (`.oc-dropdown-menu.oc-context-menu`) for a right-click area (`.oc-context-area`; children). */
export const ContextMenu = forwardRef<HTMLDivElement, ContextMenuProps>(function ContextMenu(
  { items, content, menuLabel = "Actions", menuId, className, children, onContextMenu, ...rest },
  ref,
) {
  const auto = useId().replace(/:/g, "");
  const id = menuId ?? `oc-context-menu-${auto}`;
  const menu = useRef<PopoverEl>(null);
  const open = (e: MouseEvent<HTMLDivElement>) => {
    onContextMenu?.(e);
    if (e.defaultPrevented) return;
    e.preventDefault();
    const el = menu.current;
    if (!el) return;
    el.style.setProperty("--oc-context-x", `${Math.min(e.clientX, window.innerWidth - 220)}px`);
    el.style.setProperty("--oc-context-y", `${Math.min(e.clientY, window.innerHeight - 220)}px`);
    const show = () => { try { el.showPopover?.(); } catch { /* already open */ } };
    // Firefox fires contextmenu while the right button is still down: open after the release, or that release
    // would close the menu again right away.
    if (e.buttons) window.addEventListener("pointerup", () => setTimeout(show), { once: true });
    else show();
  };
  return (
    <>
      <div ref={ref} className={cx("oc-context-area", className)} tabIndex={0} onContextMenu={open} {...rest}>{children}</div>
      <MenuPanel ref={menu} className="oc-context-menu" id={id} aria-label={menuLabel} items={items}>{content}</MenuPanel>
    </>
  );
});
