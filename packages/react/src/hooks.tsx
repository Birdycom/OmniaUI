"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { RefObject, SyntheticEvent } from "react";

/** Merge several refs into one callback ref. */
export function useMergedRef<T>(...refs: Array<React.Ref<T> | undefined>) {
  return useCallback((node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<T | null>).current = node;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refs);
}

/** Controlled + uncontrolled value in one hook. */
export function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (v: T) => void) {
  const [inner, setInner] = useState<T>(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? (value as T) : inner;
  const set = useCallback(
    (next: T) => {
      if (!controlled) setInner(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );
  return [current, set] as const;
}

export interface DialogState {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const DialogContext = createContext<{ close: () => void } | null>(null);
export const useDialogContext = () => useContext(DialogContext);

/**
 * Keeps a native <dialog> in sync with an `open` prop: showModal() / close() in an effect,
 * and reports native closes (Escape, backdrop, form method=dialog) through onOpenChange.
 */
export function useDialog(ref: RefObject<HTMLDialogElement | null>, { open, defaultOpen, onOpenChange }: DialogState) {
  const [isOpen, setOpen] = useControllable<boolean>(open, defaultOpen ?? false, onOpenChange);
  const openRef = useRef(isOpen);
  openRef.current = isOpen;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal?.();
    else if (!isOpen && dialog.open) dialog.close?.();
  }, [isOpen, ref]);

  const onClose = useCallback(
    (e: SyntheticEvent<HTMLDialogElement>) => {
      e.stopPropagation();
      if (openRef.current) setOpen(false);
    },
    [setOpen],
  );
  const close = useCallback(() => setOpen(false), [setOpen]);
  return { open: isOpen, setOpen, close, onClose };
}

/* ---------------------------------------------------------------------------------------------
 * Menu keyboard helpers (shared by DropdownMenu, Menubar and ContextMenu)
 * ------------------------------------------------------------------------------------------- */

/** Focusable items that belong directly to a `[role=menu]` (sub-menu triggers included, sub-menu items excluded). */
export function menuItems(menu: Element): HTMLElement[] {
  const out: HTMLElement[] = [];
  for (const child of Array.from(menu.children)) {
    if (child.matches('[role^="menuitem"]')) out.push(child as HTMLElement);
    else if (child.classList.contains("oc-dropdown-sub") && child.firstElementChild) out.push(child.firstElementChild as HTMLElement);
  }
  return out.filter((el) => el.getAttribute("aria-disabled") !== "true" && !(el as HTMLButtonElement).disabled);
}

/**
 * Roving focus inside an `.oc-dropdown-menu[role=menu]`: ArrowDown / ArrowUp (wrapping), Home, End,
 * ArrowRight on a sub-menu trigger enters the sub-menu, ArrowLeft inside a sub-menu returns to its trigger.
 * Returns `true` (and calls preventDefault) when the key was handled.
 */
export function handleMenuKeyDown(e: React.KeyboardEvent<HTMLElement>): boolean {
  const item = (e.target as HTMLElement).closest<HTMLElement>('[role^="menuitem"]');
  const menu = item?.closest<HTMLElement>('[role="menu"]');
  if (!item || !menu) return false;
  const items = menuItems(menu);
  const at = items.indexOf(item);
  let next: HTMLElement | undefined;
  switch (e.key) {
    case "ArrowDown":
      next = items[(at + 1) % items.length];
      break;
    case "ArrowUp":
      next = items[(at - 1 + items.length) % items.length];
      break;
    case "Home":
      next = items[0];
      break;
    case "End":
      next = items[items.length - 1];
      break;
    case "ArrowRight": {
      const sub = item.parentElement?.classList.contains("oc-dropdown-sub") ? item.parentElement.querySelector<HTMLElement>(".oc-dropdown-submenu") : null;
      next = sub ? menuItems(sub)[0] : undefined;
      break;
    }
    case "ArrowLeft":
      if (menu.classList.contains("oc-dropdown-submenu")) next = menu.parentElement?.firstElementChild as HTMLElement | undefined;
      break;
    default:
      return false;
  }
  if (!next) return false;
  e.preventDefault();
  e.stopPropagation();
  next.focus();
  return true;
}

/** Closes the popover a menu item lives in. */
export function closeMenuOf(el: Element | null) {
  (el?.closest("[popover]") as (HTMLElement & { hidePopover?: () => void }) | null)?.hidePopover?.();
}

/** Focuses the first menu item whenever the popover opens (the native `toggle` event). */
export function useMenuAutofocus(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onToggle = (e: Event) => {
      if ((e as Event & { newState?: string }).newState === "open") menuItems(el)[0]?.focus();
    };
    el.addEventListener("toggle", onToggle);
    return () => el.removeEventListener("toggle", onToggle);
  }, [ref]);
}
