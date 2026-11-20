// File: packages/vue/src/composables/useMenuKeys.ts
// Map: items of one [role=menu] -> arrow keys (roving focus, sub-menus) -> focus the first item when the popover opens
// Keyboard for the .oc-dropdown-menu[role=menu] popovers of OcMenubar and OcContextMenu (same rules as the React hooks).

/** Focusable items that belong directly to a menu (sub-menu triggers included, sub-menu items excluded). */
export function menuItems(menu: Element): HTMLElement[] {
  const out: HTMLElement[] = []
  for (const child of Array.from(menu.children)) {
    if (child.matches('[role^="menuitem"]')) out.push(child as HTMLElement)
    else if (child.classList.contains('oc-dropdown-sub') && child.firstElementChild) out.push(child.firstElementChild as HTMLElement)
  }
  return out.filter((el) => el.getAttribute('aria-disabled') !== 'true' && !(el as HTMLButtonElement).disabled)
}

/** ArrowDown / ArrowUp (wrapping), Home, End; ArrowRight enters a sub-menu, ArrowLeft goes back to its trigger. */
export function onMenuKeydown(e: KeyboardEvent): void {
  const item = (e.target as HTMLElement).closest<HTMLElement>('[role^="menuitem"]')
  const menu = item?.closest<HTMLElement>('[role="menu"]')
  if (!item || !menu) return
  const items = menuItems(menu)
  const at = items.indexOf(item)
  let next: HTMLElement | undefined
  if (e.key === 'ArrowDown') next = items[(at + 1) % items.length]
  else if (e.key === 'ArrowUp') next = items[(at - 1 + items.length) % items.length]
  else if (e.key === 'Home') next = items[0]
  else if (e.key === 'End') next = items[items.length - 1]
  else if (e.key === 'ArrowRight') {
    const sub = item.parentElement?.classList.contains('oc-dropdown-sub') ? item.parentElement.querySelector('.oc-dropdown-submenu') : null
    next = sub ? menuItems(sub)[0] : undefined
  } else if (e.key === 'ArrowLeft' && menu.classList.contains('oc-dropdown-submenu')) next = menu.parentElement?.firstElementChild as HTMLElement | undefined
  if (!next) return
  e.preventDefault()
  e.stopPropagation()
  next.focus()
}

/** On the native `toggle` event of a menu popover: focus the first item when it opens. */
export function onMenuToggle(e: Event): void {
  if ((e as Event & { newState?: string }).newState === 'open') menuItems(e.currentTarget as Element)[0]?.focus()
}

/** Closes the popover a menu item lives in. */
export function closeMenuOf(el: Element | null): void {
  try { (el?.closest('[popover]') as (HTMLElement & { hidePopover?: () => void }) | null)?.hidePopover?.() } catch { /* already closed */ }
}
