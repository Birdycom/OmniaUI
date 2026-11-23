// File: packages/vue/src/composables/useSidebar.ts
// Map: context type + injection key -> storage helpers (localStorage / cookie) -> useSidebar() / useSidebarOptional()
// The state of the nearest OcSidebarProvider (0.17.0), for OcSidebar, OcSidebarTrigger, OcSidebarRail and your own code.
import { inject } from 'vue'
import type { InjectionKey, Ref } from 'vue'

export interface SidebarContext {
  /** The sidebar shows icons only (desktop) or is closed (mobile). */
  collapsed: Ref<boolean>
  /** Below the mobile breakpoint: the sidebar opens over the page. */
  isMobile: Ref<boolean>
  /** Mobile: the overlay is open. */
  openMobile: Ref<boolean>
  setCollapsed: (collapsed: boolean) => void
  toggle: () => void
}

export const sidebarKey: InjectionKey<SidebarContext> = Symbol('oc-sidebar-provider')

/** The state of the nearest OcSidebarProvider (throws outside one). */
export function useSidebar(): SidebarContext {
  const ctx = inject(sidebarKey, null)
  if (!ctx) throw new Error('useSidebar() must be used inside <OcSidebarProvider>.')
  return ctx
}

/** The state of the nearest OcSidebarProvider, or null outside one. */
export function useSidebarOptional(): SidebarContext | null {
  return inject(sidebarKey, null)
}

/** localStorage key `oc-sidebar:<key>` or cookie `oc-sidebar-<key>` ("1" = collapsed, "0" = open); null without a key. */
export function sidebarStorageKey(persist: string | boolean | undefined, storage: 'local' | 'cookie' = 'local'): string | null {
  if (!persist) return null
  const key = persist === true ? 'default' : persist
  return storage === 'cookie' ? `oc-sidebar-${key}` : `oc-sidebar:${key}`
}

export function readSidebarState(name: string | null, storage: 'local' | 'cookie'): boolean | undefined {
  if (!name || typeof document === 'undefined') return undefined
  try {
    const raw = storage === 'cookie'
      ? document.cookie.split('; ').find((c) => c.startsWith(`${name}=`))?.slice(name.length + 1)
      : window.localStorage.getItem(name)
    return raw === '1' ? true : raw === '0' ? false : undefined
  } catch {
    return undefined
  }
}

export function writeSidebarState(name: string | null, storage: 'local' | 'cookie', collapsed: boolean) {
  if (!name || typeof document === 'undefined') return
  try {
    if (storage === 'cookie') document.cookie = `${name}=${collapsed ? '1' : '0'}; path=/; max-age=31536000; samesite=lax`
    else window.localStorage.setItem(name, collapsed ? '1' : '0')
  } catch {
    // Private mode can block storage: the sidebar still works for this visit.
  }
}
