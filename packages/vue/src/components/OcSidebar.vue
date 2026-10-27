<script setup lang="ts">
/**
 * Vertical navigation shell. Slots: header, default (scrolling content: OcSidebarGroup...), footer.
 * Classes: .oc-sidebar(--collapsed/--right/--floating/--dark), -header, -content, -footer.
 * Compose with OcSidebarGroup, OcSidebarMenu, OcSidebarMenuButton, OcSidebarCollapsible, OcSidebarSeparator.
 */
defineProps<{ collapsed?: boolean; right?: boolean; floating?: boolean; dark?: boolean; label?: string }>()
</script>

<template>
  <aside :class="['oc-sidebar', collapsed && 'oc-sidebar--collapsed', right && 'oc-sidebar--right', floating && 'oc-sidebar--floating', dark && 'oc-sidebar--dark']" :aria-label="label">
    <div v-if="$slots.header" class="oc-sidebar-header"><slot name="header" /></div>
    <div class="oc-sidebar-content"><slot /></div>
    <div v-if="$slots.footer" class="oc-sidebar-footer"><slot name="footer" /></div>
  </aside>
</template>
