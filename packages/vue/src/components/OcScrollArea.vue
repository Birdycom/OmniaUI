<script setup lang="ts">
/** Bounded scroll region (focusable, role=region) with themed scrollbar. `label` = aria-label. Classes: .oc-scroll-area(--x/--shadows/--bare)
 * bare (0.18.0): only the scrolling and the themed scrollbar, no padding, frame or height cap. */
defineProps<{ horizontal?: boolean; shadows?: boolean; bare?: boolean; label?: string }>()
</script>

<template>
  <div
    :class="['oc-scroll-area', horizontal && 'oc-scroll-area--x', shadows && 'oc-scroll-area--shadows', bare && 'oc-scroll-area--bare']"
    tabindex="0"
    role="region"
    :aria-label="label"
  >
    <slot />
  </div>
</template>
