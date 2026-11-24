<!-- File: packages/vue/src/components/OcSplitBar.vue | Map: props -> OcProgress with segments -> optional legend -->
<script setup lang="ts">
/** 0.18.0: a split bar (right / wrong, done / open): OcProgress with `segments` [{ value, tone, label }] and an optional
 *  legend (dot, label and value per part). `max` is the total (default the sum of the parts). */
import OcProgress from './OcProgress.vue'

withDefaults(
  defineProps<{
    segments: { value: number; tone?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'; label?: string }[]
    max?: number
    size?: 'xs' | 'sm' | 'md'
    track?: 'plain' | 'striped'
    label?: string
    legend?: boolean
  }>(),
  { max: undefined, size: 'md', track: 'plain', label: undefined, legend: false },
)
</script>

<template>
  <div v-if="legend">
    <OcProgress :segments="segments" :max="max" :size="size" :track="track" :label="label" />
    <ul class="oc-progress-legend">
      <li v-for="(p, i) in segments" :key="i" :class="p.tone && p.tone !== 'default' ? `oc-progress-segment--${p.tone}` : undefined">{{ p.label ?? `Part ${i + 1}` }} {{ p.value }}</li>
    </ul>
  </div>
  <OcProgress v-else :segments="segments" :max="max" :size="size" :track="track" :label="label" />
</template>
