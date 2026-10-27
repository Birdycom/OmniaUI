<script setup lang="ts">
/** Loading skeleton. Classes: .oc-skeleton--circle/rect/text/title */
withDefaults(defineProps<{ variant?: 'text' | 'title' | 'circle' | 'rect' }>(), { variant: 'text' })
</script>

<template>
  <div :class="['oc-skeleton', `oc-skeleton--${variant}`]"></div>
</template>
