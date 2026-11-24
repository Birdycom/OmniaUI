<script setup lang="ts">
/** Progress bar. `value` of `max` (default 100). Classes: .oc-progress(--sm/--xs/--glow), .oc-progress-bar--success/warning/danger,
 *  .oc-progress-marker. `levels`: warning from 70 %, danger from 90 % (or [warning, danger]); an explicit variant wins.
 *  `marker`: a target point in the unit of `value`.
 *  0.18.0: `track="striped"` (.oc-progress--striped: flat stripes on the part still to do); `segments` [{ value, tone, label }]
 *  makes a split bar (.oc-progress--split, role img with the parts as label; `max` = total, default the sum). */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    value?: number
    max?: number
    variant?: 'default' | 'success' | 'warning' | 'danger'
    size?: 'xs' | 'sm' | 'md'
    glow?: boolean
    levels?: boolean | [number, number]
    marker?: number
    label?: string
    track?: 'plain' | 'striped'
    segments?: { value: number; tone?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'; label?: string }[]
  }>(),
  { value: 0, max: undefined, variant: 'default', size: 'md', levels: false, track: 'plain', segments: undefined },
)
const limit = computed(() => props.max ?? 100)
const widths = computed(() => {
  const parts = props.segments ?? []
  const total = props.max && props.max > 0 ? props.max : parts.reduce((s, p) => s + Math.max(0, p.value), 0)
  return parts.map((p) => (total > 0 ? Math.round((Math.max(0, p.value) / total) * 10000) / 100 : 0))
})
const splitLabel = computed(() => (props.segments ?? []).map((p, i) => `${p.label ?? `Part ${i + 1}`} ${p.value}`).join(', '))
const pct = (v: number) => (limit.value > 0 ? Math.min(100, Math.max(0, (v / limit.value) * 100)) : 0)
const percent = computed(() => Math.round(pct(props.value)))
const tone = computed(() => {
  if (props.variant !== 'default' || !props.levels) return props.variant
  const [warn, danger] = props.levels === true ? [70, 90] : props.levels
  return percent.value >= danger ? 'danger' : percent.value >= warn ? 'warning' : 'default'
})
</script>

<template>
  <div
    v-if="segments"
    :class="['oc-progress', 'oc-progress--split', size !== 'md' && `oc-progress--${size}`, track === 'striped' && 'oc-progress--striped']"
    role="img"
    :aria-label="label ?? splitLabel"
  >
    <span
      v-for="(p, i) in segments"
      :key="i"
      :class="['oc-progress-segment', p.tone && p.tone !== 'default' && `oc-progress-segment--${p.tone}`]"
      :style="{ inlineSize: `${widths[i]}%` }"
      :title="p.label ? `${p.label}: ${p.value}` : undefined"
    ></span>
  </div>
  <div
    v-else
    :class="['oc-progress', size !== 'md' && `oc-progress--${size}`, glow && 'oc-progress--glow', track === 'striped' && 'oc-progress--striped']"
    role="progressbar"
    :aria-valuenow="value"
    aria-valuemin="0"
    :aria-valuemax="limit"
    :aria-label="label"
  >
    <div :class="['oc-progress-bar', tone !== 'default' && `oc-progress-bar--${tone}`]" :style="{ width: `${percent}%` }"></div>
    <span v-if="marker != null" class="oc-progress-marker" :style="{ left: `${pct(marker)}%` }"></span>
  </div>
</template>
