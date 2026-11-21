<!-- File: packages/vue/src/components/OcSidebarTrigger.vue | Map: inject provider -> button.oc-sidebar-trigger (aria-expanded) -> toggle -->
<script setup lang="ts">
/**
 * Opens or collapses the sidebar of the OcSidebarProvider (0.17.0). label: accessible name (default "Toggle sidebar");
 * icon: webicon name (default "mdi:menu"); the default slot replaces the icon.
 */
import { computed } from 'vue'
import { useSidebarOptional } from '../composables/useSidebar'
import OcWebicon from './OcWebicon.vue'

withDefaults(defineProps<{ label?: string; icon?: string }>(), { label: 'Toggle sidebar', icon: 'mdi:menu' })
const ctx = useSidebarOptional()
const expanded = computed(() => (ctx ? !ctx.collapsed.value : undefined))
</script>

<template>
  <button type="button" class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm oc-sidebar-trigger" :aria-label="label" :title="label" :aria-expanded="expanded" data-oc-sidebar-trigger @click="ctx?.toggle()">
    <slot><OcWebicon :name="icon" /></slot>
  </button>
</template>
