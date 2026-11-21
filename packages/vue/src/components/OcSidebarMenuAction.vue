<!-- File: packages/vue/src/components/OcSidebarMenuAction.vue | Map: props -> button.oc-sidebar-menu-action (icon or slot) -->
<script setup lang="ts">
/**
 * A small button on the right of a sidebar menu item (more, add …) (0.17.0). Put it in the <li> next to the
 * OcSidebarMenuButton. label: accessible name and tooltip; icon: webicon name (default "mdi:dots-vertical");
 * show-on-hover: only visible while the item is hovered or has focus.
 */
import OcWebicon from './OcWebicon.vue'

withDefaults(defineProps<{ label: string; icon?: string; showOnHover?: boolean }>(), { icon: 'mdi:dots-vertical', showOnHover: false })
</script>

<template>
  <button type="button" :class="['oc-sidebar-menu-action', showOnHover && 'oc-sidebar-menu-action--hover']" :aria-label="label" :title="label">
    <slot><OcWebicon :name="icon" /></slot>
  </button>
</template>
