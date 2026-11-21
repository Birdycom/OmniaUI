// File: packages/ui/src/sidebar.d.ts
// Types for the sidebar provider script (persist, mobile overlay, trigger, rail, shortcut).

export interface SidebarProviderController {
  /** The sidebar shows icons only (desktop) or is closed (mobile). */
  collapsed: boolean;
  /** Below the mobile breakpoint. */
  isMobile: boolean;
  setCollapsed(collapsed: boolean): void;
  toggle(): void;
}

/** Detail of the oc-sidebar-change event on the provider. */
export interface SidebarChangeDetail {
  collapsed: boolean;
  mobile: boolean;
}

export function sidebarStorageKey(key: string | boolean | null | undefined, storage?: "local" | "cookie"): string | null;
export function bindSidebarProvider(root: HTMLElement): SidebarProviderController | null;
export function getSidebarProvider(root: HTMLElement): SidebarProviderController | null;
export function initSidebarProviders(scope?: ParentNode): void;
