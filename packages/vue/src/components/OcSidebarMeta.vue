<!-- File: packages/vue/src/components/OcSidebarMeta.vue | Map: props -> div.oc-sidebar-meta (brand, version, copyright; the line as tooltip) -->
<script setup lang="ts">
/** Meta line for the footer of an app sidebar: brand, version, copyright. Collapsed: only the version, the line as tooltip. */
import { computed } from 'vue'

const props = defineProps<{ brand?: string; version?: string; copyright?: string }>()
const line = computed(() => [[props.brand, props.version].filter(Boolean).join(' '), props.copyright].filter(Boolean).join(' · '))
</script>

<template>
  <div class="oc-sidebar-meta oc-tooltip oc-tooltip--right" :data-tooltip="line" tabindex="0">
    <span v-if="brand" class="oc-sidebar-meta__brand">{{ brand }}</span>
    <span v-if="version" class="oc-sidebar-meta__version">{{ version }}</span>
    <span v-if="copyright" class="oc-sidebar-meta__copy">{{ copyright }}</span>
  </div>
</template>
