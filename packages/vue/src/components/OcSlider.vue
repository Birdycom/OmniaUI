<script setup lang="ts">
/**
 * Native range input. v-model: number. Keeps --oc-slider-progress in sync (the fill for Chromium/WebKit).
 * Native attributes (id, aria-label, disabled...) fall through to the input. Classes: .oc-slider(--vertical)
 */
import { computed } from 'vue'

const props = withDefaults(defineProps<{ min?: number; max?: number; step?: number; vertical?: boolean }>(), { min: 0, max: 100 })
const model = defineModel<number>({ default: 0 })
const progress = computed(() => {
  const span = props.max - props.min
  const pct = span > 0 ? ((model.value - props.min) / span) * 100 : 0
  return `${Math.min(100, Math.max(0, pct))}%`
})
</script>

<template>
  <input
    v-model.number="model"
    :class="['oc-slider', vertical && 'oc-slider--vertical']"
    type="range"
    :min="min"
    :max="max"
    :step="step"
    :style="{ '--oc-slider-progress': progress }"
  />
</template>
