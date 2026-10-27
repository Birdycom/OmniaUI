<script setup lang="ts">
/**
 * Top bar with sidebar toggle, module navigation and user actions.
 * `toggleFor` = id of the checkbox that collapses the sidebar (see OcBlockAppShell).
 * Slots: toggle (replaces the default hamburger label), nav (replaces the items), title, actions.
 * Classes: .oc-block-appbar, -nav, -actions, -title
 */
import OcNavmenuList, { type NavmenuItem } from '../components/OcNavmenuList.vue'

withDefaults(
  defineProps<{
    toggleFor?: string
    toggleLabel?: string
    navItems?: NavmenuItem[]
    navLabel?: string
    title?: string
  }>(),
  { toggleLabel: 'Toggle sidebar', navLabel: 'Module navigation' },
)
</script>

<template>
  <header class="oc-block-appbar">
    <slot name="toggle">
      <label v-if="toggleFor" class="oc-btn oc-btn--ghost oc-btn--icon" :for="toggleFor" :title="toggleLabel">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        <span class="oc-visually-hidden">{{ toggleLabel }}</span>
      </label>
    </slot>
    <span v-if="title" class="oc-block-appbar-title">{{ title }}</span>
    <nav v-if="navItems?.length || $slots.nav" class="oc-block-appbar-nav" :aria-label="navLabel">
      <slot name="nav"><OcNavmenuList :items="navItems" /></slot>
    </nav>
    <div v-if="$slots.actions" class="oc-block-appbar-actions"><slot name="actions" /></div>
  </header>
</template>
