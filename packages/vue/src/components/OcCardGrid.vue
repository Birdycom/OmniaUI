<script setup lang="ts">
/**
 * A responsive grid of cards (.oc-card-grid: auto-fill columns of at least `min`). min / gap: --oc-card-min (default 17rem) and
 * --oc-card-gap (default 1.25rem); a number is read as rem. bands: the cards share their rows (subgrid), so bands, content and
 * footers line up (.oc-card-grid--bands). wide: cards from 32rem, three in a row on a wide screen. fit: fewer cards than fit
 * in a row stretch over the full width.
 */
import { computed } from 'vue'

const props = defineProps<{ min?: string | number; gap?: string | number; bands?: boolean; wide?: boolean; fit?: boolean }>()
const rem = (v: string | number) => (typeof v === 'number' ? `${v}rem` : v)
const style = computed(() => {
  const out: Record<string, string> = {}
  if (props.min != null) out['--oc-card-min'] = rem(props.min)
  if (props.gap != null) out['--oc-card-gap'] = rem(props.gap)
  return Object.keys(out).length ? out : undefined
})
</script>

<template>
  <div :class="['oc-card-grid', bands && 'oc-card-grid--bands', wide && 'oc-card-grid--wide', fit && 'oc-card-grid--fit']" :style="style">
    <slot />
  </div>
</template>
