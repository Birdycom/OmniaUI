<script setup lang="ts">
/** Progress bar. `value` of `max` (default 100). Classes: .oc-progress-bar--success/warning/danger */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    value: number
    max?: number
    variant?: 'default' | 'success' | 'warning' | 'danger'
    label?: string
  }>(),
  { max: 100, variant: 'default' },
)
const percent = computed(() => Math.min(100, Math.max(0, Math.round((props.value / props.max) * 100))))
</script>

<template>
  <div class="oc-progress" role="progressbar" :aria-valuenow="value" aria-valuemin="0" :aria-valuemax="max" :aria-label="label">
    <div :class="['oc-progress-bar', variant !== 'default' && `oc-progress-bar--${variant}`]" :style="{ width: `${percent}%` }"></div>
  </div>
</template>
