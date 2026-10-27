<script setup lang="ts">
/** Bounded scroll region (focusable, role=region) with themed scrollbar. `label` = aria-label. Classes: .oc-scroll-area(--x/--shadows) */
defineProps<{ horizontal?: boolean; shadows?: boolean; label?: string }>()
</script>

<template>
  <div
    :class="['oc-scroll-area', horizontal && 'oc-scroll-area--x', shadows && 'oc-scroll-area--shadows']"
    tabindex="0"
    role="region"
    :aria-label="label"
  >
    <slot />
  </div>
</template>
