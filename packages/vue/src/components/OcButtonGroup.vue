<script setup lang="ts">
/** Joined buttons with shared borders. `label` becomes aria-label. Put OcButton (usually variant outline) and OcButtonGroupText inside. Classes: .oc-btn-group(--vertical) */
defineProps<{ vertical?: boolean; label?: string }>()
</script>

<template>
  <div :class="['oc-btn-group', vertical && 'oc-btn-group--vertical']" role="group" :aria-label="label">
    <slot />
  </div>
</template>
