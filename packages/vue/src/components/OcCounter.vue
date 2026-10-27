<script setup lang="ts">
/** Animated number (@property). Starts when scrolled into view unless `onView` is false. */
import { computed } from 'vue'

const props = withDefaults(defineProps<{ to: number; suffix?: string; onView?: boolean }>(), { onView: true })
const style = computed(() => {
  const s: Record<string, string> = { '--oc-counter-to': String(props.to) }
  if (props.suffix) s['--oc-counter-suffix'] = `'${props.suffix}'`
  return s
})
</script>

<template>
  <strong :class="['oc-counter', onView && 'oc-counter--on-view']" :style="style"></strong>
</template>
