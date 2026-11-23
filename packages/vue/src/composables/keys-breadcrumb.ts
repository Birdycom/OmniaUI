// File: packages/vue/src/composables/keys-breadcrumb.ts
// Map: breadcrumb context (OcBreadcrumb -> OcBreadcrumbList -> OcBreadcrumbItem / OcBreadcrumbSeparator) -> collapse helper
// 0.17.1 compound breadcrumb: provide in OcBreadcrumb (separator) and OcBreadcrumbList (items become <li>).

import type { InjectionKey } from 'vue'

export interface BreadcrumbContext {
  separator: 'slash' | 'chevron'
  inList: boolean
}
export const breadcrumbKey: InjectionKey<BreadcrumbContext> = Symbol('oc-breadcrumb')

/** Which levels to show and which to fold: [before, hidden, after], or null when the trail fits. */
export function collapseBreadcrumb<T>(items: T[], maxItems?: number, itemsBefore = 1, itemsAfter = 2): [T[], T[], T[]] | null {
  if (!maxItems || items.length <= maxItems || itemsBefore + itemsAfter >= items.length) return null
  return [items.slice(0, itemsBefore), items.slice(itemsBefore, items.length - itemsAfter), items.slice(items.length - itemsAfter)]
}
