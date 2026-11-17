<!-- File: packages/vue/src/components/OcCountdown.vue | Map: props -> end time -> tick (250ms) -> state (left, fraction, low/done) -> markup -->
<script setup lang="ts">
/**
 * Time left (.oc-countdown): inline, a pill or large digits (variant), optionally with a shrinking bar. `until` (Date,
 * ISO string or ms) or `seconds` from mount; `total` for the bar, `low` for the orange state. role="timer".
 * Emits `end` once at zero.
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { countdownState, formatCountdown } from '../../../ui/src/countdown.js'

const props = withDefaults(defineProps<{
  until?: Date | string | number
  seconds?: number
  total?: number
  low?: number
  label?: string
  variant?: 'inline' | 'pill' | 'display'
  bar?: boolean
  paused?: boolean
}>(), { label: 'Time left', variant: 'inline' })
const emit = defineEmits<{ end: [] }>()

const toMs = (v: Date | string | number) => (v instanceof Date ? v.getTime() : typeof v === 'number' ? v : Date.parse(v))
const start = Date.now()
const endAt = computed(() => (props.until != null ? toMs(props.until) : start + (props.seconds ?? 0) * 1000))
const full = Math.max(1, (endAt.value - start) / 1000)
const left = ref((endAt.value - Date.now()) / 1000)
let timer: ReturnType<typeof setInterval> | undefined
let ended = false
function tick() {
  left.value = (endAt.value - Date.now()) / 1000
  if (left.value <= 0 && !ended) { ended = true; emit('end') }
}
function run() {
  clearInterval(timer)
  if (props.paused) return
  tick()
  timer = setInterval(tick, 250)
}
onMounted(run)
watch(() => [props.paused, endAt.value], run)
onBeforeUnmount(() => clearInterval(timer))
const state = computed(() => countdownState(left.value, props.total ?? full, props.low))
</script>

<template>
  <div
    role="timer"
    :aria-label="label"
    :class="['oc-countdown', variant !== 'inline' && `oc-countdown--${variant}`, bar && 'oc-countdown--bar']"
    :data-state="state.state || undefined"
    :style="{ '--oc-countdown-left': String(state.fraction) }"
  >
    <span v-if="label" class="oc-countdown-label">{{ label }}</span>
    <b class="oc-countdown-time">{{ formatCountdown(state.left) }}</b>
  </div>
</template>
