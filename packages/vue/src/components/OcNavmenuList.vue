<script setup lang="ts">
/**
 * The <ul class="oc-navmenu"> of the navigation menu, without the surrounding <nav>
 * (used by OcNavmenu and by blocks that provide their own <nav>).
 * Pass `items`, or put your own <li> elements in the default slot.
 * Classes: .oc-navmenu, .oc-navmenu-link(--caret) with aria-current="page"
 */
import { useUid } from '../composables/useUid'

export interface NavmenuItem {
  label: string
  href?: string
  current?: boolean
  /** Dropdown entries; turns the item into a popover trigger. */
  children?: { label: string; href: string }[]
  /** Heading inside the dropdown. */
  heading?: string
}
withDefaults(defineProps<{ items?: NavmenuItem[] }>(), { items: () => [] })
const base = useUid('oc-navmenu')
</script>

<template>
  <ul class="oc-navmenu">
    <slot>
      <li v-for="(item, i) in items" :key="i">
        <template v-if="item.children?.length">
          <button class="oc-navmenu-link oc-navmenu-link--caret" type="button" :popovertarget="`${base}-${i}`">{{ item.label }}</button>
          <div :id="`${base}-${i}`" class="oc-dropdown-menu" popover>
            <div v-if="item.heading" class="oc-dropdown-label">{{ item.heading }}</div>
            <a v-for="child in item.children" :key="child.href + child.label" class="oc-dropdown-item" :href="child.href">{{ child.label }}</a>
          </div>
        </template>
        <a v-else class="oc-navmenu-link" :href="item.href ?? '#'" :aria-current="item.current ? 'page' : undefined">{{ item.label }}</a>
      </li>
    </slot>
  </ul>
</template>
