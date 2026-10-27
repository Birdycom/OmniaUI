<script setup lang="ts">
/**
 * Application layout: sidebar, header bar, breadcrumb strip and scrolling content.
 * v-model:collapsed drives the hidden checkbox (`toggleId`) that collapses the sidebar; point the header's
 * toggle label at the same id. `height` sets --oc-block-shell-height (default 100dvh).
 * Slots: sidebar (an OcSidebar), header (an OcBlockAppHeader), breadcrumbs, default (content).
 * Classes: .oc-block-shell, -toggle, -main, -breadcrumbs, -content
 */
import { computed } from 'vue'

const props = withDefaults(defineProps<{ toggleId?: string; height?: string; toggleLabel?: string }>(), {
  toggleId: 'oc-shell-toggle',
  toggleLabel: 'Collapse sidebar',
})
const collapsed = defineModel<boolean>('collapsed', { default: false })
const style = computed(() => (props.height ? { '--oc-block-shell-height': props.height } : undefined))
</script>

<template>
  <div class="oc-block-shell" :style="style">
    <input :id="toggleId" v-model="collapsed" class="oc-block-shell-toggle" type="checkbox" :aria-label="toggleLabel" />
    <slot name="sidebar" />
    <div class="oc-block-shell-main">
      <slot name="header" />
      <div v-if="$slots.breadcrumbs" class="oc-block-shell-breadcrumbs"><slot name="breadcrumbs" /></div>
      <main class="oc-block-shell-content"><slot /></main>
    </div>
  </div>
</template>
