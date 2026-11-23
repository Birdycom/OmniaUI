<script setup lang="ts">
/**
 * The <ul class="oc-navmenu"> of the navigation menu, without the surrounding <nav>
 * (used by OcNavmenu and by blocks that provide their own <nav>).
 * Pass `items`, or put your own <li> elements in the default slot.
 * variant="site": outlined pill links (.oc-navmenu--site, the site header menu).
 * Classes: .oc-navmenu(--site), .oc-navmenu-link(--caret) with aria-current="page"
 */
import { useUid } from '../composables/useUid'

/** A link in a dropdown, or a group heading in it ({ group: 'Documents' }). */
export type NavmenuChild = { label: string; href: string; group?: undefined } | { group: string; label?: undefined; href?: undefined }

export interface NavmenuItem {
  label: string
  href?: string
  current?: boolean
  /** Dropdown entries (links, or { group } headings); turns the item into a popover trigger. */
  children?: NavmenuChild[]
  /** Heading inside the dropdown. */
  heading?: string
}
withDefaults(defineProps<{ items?: NavmenuItem[]; variant?: 'site' }>(), { items: () => [] })
const base = useUid('oc-navmenu')
</script>

<template>
  <ul :class="['oc-navmenu', variant && `oc-navmenu--${variant}`]">
    <slot>
      <li v-for="(item, i) in items" :key="i">
        <template v-if="item.children?.length">
          <button class="oc-navmenu-link oc-navmenu-link--caret" type="button" :popovertarget="`${base}-${i}`">{{ item.label }}</button>
          <div :id="`${base}-${i}`" class="oc-dropdown-menu" popover>
            <div v-if="item.heading" class="oc-dropdown-label">{{ item.heading }}</div>
            <template v-for="(child, j) in item.children" :key="j">
              <div v-if="child.group" class="oc-dropdown-label">{{ child.group }}</div>
              <a v-else class="oc-dropdown-item" :href="child.href">{{ child.label }}</a>
            </template>
          </div>
        </template>
        <a v-else class="oc-navmenu-link" :href="item.href ?? '#'" :aria-current="item.current ? 'page' : undefined">{{ item.label }}</a>
      </li>
    </slot>
  </ul>
</template>
