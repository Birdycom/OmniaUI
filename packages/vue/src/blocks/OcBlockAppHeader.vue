<script setup lang="ts">
/**
 * Top bar with sidebar toggle, module navigation and user actions.
 * `toggleFor` = id of the checkbox that collapses the sidebar (see OcBlockAppShell).
 * Slots: toggle (replaces the default hamburger label), nav (replaces the items), title, search, actions.
 * searchCollapse (0.17.1): on a narrow bar the search slot shrinks to a magnifier and opens over the bar on focus.
 * 0.17.0: overflow = the nav-items that do not fit go into a "More" menu (ResizeObserver; more-label, default "More"; the
 * More button is marked current when the current page is in it); search slot between nav and actions; module = data-module.
 * Classes: .oc-block-appbar, -nav(--overflow), -more, -search, -actions, -title
 */
import { computed, ref, toRef } from 'vue'
import OcNavmenuList, { type NavmenuItem } from '../components/OcNavmenuList.vue'
import { useUid } from '../composables/useUid'
import { useNavOverflow } from '../composables/useNavOverflow'

const props = withDefaults(
  defineProps<{
    toggleFor?: string
    toggleLabel?: string
    navItems?: NavmenuItem[]
    navLabel?: string
    title?: string
    overflow?: boolean
    moreLabel?: string
    /** 0.17.1: on a narrow bar (below 40rem) the search shrinks to a magnifier and opens over the bar on focus. */
    searchCollapse?: boolean
    module?: string
  }>(),
  { toggleLabel: 'Toggle sidebar', navLabel: 'Module navigation', moreLabel: 'More' },
)
const list = ref<HTMLElement | null>(null)
const items = computed(() => props.navItems ?? [])
const { visible } = useNavOverflow(list, computed(() => items.value.length), toRef(() => !!props.overflow))
const hidden = computed(() => (props.overflow ? items.value.slice(visible.value) : []))
const moreCurrent = computed(() => hidden.value.some((item) => item.current))
const menuId = useUid('oc-appbar-more')
const off = (i: number) => !!props.overflow && i >= visible.value
const DOTS = 'M16 12a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2m-6 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2m-6 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2'
</script>

<template>
  <header class="oc-block-appbar" :data-module="module">
    <slot name="toggle">
      <label v-if="toggleFor" class="oc-btn oc-btn--ghost oc-btn--icon" :for="toggleFor" :title="toggleLabel">
        <svg data-icon="mdi:menu" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/></svg>
        <span class="oc-visually-hidden">{{ toggleLabel }}</span>
      </label>
    </slot>
    <span v-if="title" class="oc-block-appbar-title">{{ title }}</span>
    <nav v-if="overflow && navItems?.length && !$slots.nav" class="oc-block-appbar-nav oc-block-appbar-nav--overflow" :aria-label="navLabel">
      <ul ref="list" class="oc-navmenu">
        <li v-for="(item, i) in navItems" :key="i" :data-oc-hidden="off(i) ? '' : undefined" :aria-hidden="off(i) ? 'true' : undefined">
          <a class="oc-navmenu-link" :href="item.href" :aria-current="item.current ? 'page' : undefined" :tabindex="off(i) ? -1 : undefined">{{ item.label }}</a>
        </li>
        <li data-oc-nav-more="" :data-oc-hidden="hidden.length ? undefined : ''" :aria-hidden="hidden.length ? undefined : 'true'">
          <button
            class="oc-navmenu-link oc-block-appbar-more"
            type="button"
            :popovertarget="menuId"
            aria-haspopup="menu"
            :aria-current="moreCurrent ? 'page' : undefined"
            :tabindex="hidden.length ? undefined : -1"
          >
            <svg data-icon="mdi:dots-horizontal" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path :d="DOTS" /></svg>{{ moreLabel }}
          </button>
          <div :id="menuId" class="oc-dropdown-menu" role="menu" popover>
            <a v-for="(item, i) in hidden" :key="i" class="oc-dropdown-item" role="menuitem" :href="item.href" :aria-current="item.current ? 'page' : undefined">{{ item.label }}</a>
          </div>
        </li>
      </ul>
    </nav>
    <nav v-else-if="navItems?.length || $slots.nav" class="oc-block-appbar-nav" :aria-label="navLabel">
      <slot name="nav"><OcNavmenuList :items="navItems" /></slot>
    </nav>
    <div v-if="$slots.search" :class="['oc-block-appbar-search', searchCollapse && 'oc-block-appbar-search--collapse']"><slot name="search" /></div>
    <div v-if="$slots.actions" class="oc-block-appbar-actions"><slot name="actions" /></div>
  </header>
</template>
