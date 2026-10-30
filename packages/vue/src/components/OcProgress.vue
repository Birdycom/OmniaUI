<script setup lang="ts">
/** Progress bar. `value` of `max` (default 100). Classes: .oc-progress(--sm/--xs/--glow), .oc-progress-bar--success/warning/danger,
 *  .oc-progress-marker. `levels`: warning from 70 %, danger from 90 % (or [warning, danger]); an explicit variant wins.
 *  `marker`: a target point in the unit of `value`. */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    value: number
    max?: number
    variant?: 'default' | 'success' | 'warning' | 'danger'
    size?: 'xs' | 'sm' | 'md'
    glow?: boolean
    levels?: boolean | [number, number]
    marker?: number
    label?: string
  }>(),
  { max: 100, variant: 'default', size: 'md', levels: false },
)
const pct = (v: number) => (props.max > 0 ? Math.min(100, Math.max(0, (v / props.max) * 100)) : 0)
const percent = computed(() => Math.round(pct(props.value)))
const tone = computed(() => {
  if (props.variant !== 'default' || !props.levels) return props.variant
  const [warn, danger] = props.levels === true ? [70, 90] : props.levels
  return percent.value >= danger ? 'danger' : percent.value >= warn ? 'warning' : 'default'
})
</script>

<template>
  <div
    :class="['oc-progress', size !== 'md' && `oc-progress--${size}`, glow && 'oc-progress--glow']"
    role="progressbar"
    :aria-valuenow="value"
    aria-valuemin="0"
    :aria-valuemax="max"
    :aria-label="label"
  >
    <div :class="['oc-progress-bar', tone !== 'default' && `oc-progress-bar--${tone}`]" :style="{ width: `${percent}%` }"></div>
    <span v-if="marker != null" class="oc-progress-marker" :style="{ left: `${pct(marker)}%` }"></span>
  </div>
</template>
