<!-- File: packages/vue/src/components/OcSidebarRail.vue | Map: inject provider -> button.oc-sidebar-rail -> toggle -->
<script setup lang="ts">
/** A thin hit area on the sidebar edge that toggles it (0.17.0). Put it right after OcSidebar in OcSidebarProvider. */
import { useSidebarOptional } from '../composables/useSidebar'

withDefaults(defineProps<{ label?: string }>(), { label: 'Toggle sidebar' })
const ctx = useSidebarOptional()
</script>

<template>
  <button type="button" tabindex="-1" class="oc-sidebar-rail" :aria-label="label" :title="label" data-oc-sidebar-rail @click="ctx?.toggle()"></button>
</template>
