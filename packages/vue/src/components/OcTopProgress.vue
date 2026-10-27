<!-- File: packages/vue/src/components/OcTopProgress.vue | Map: progress.oc-top-progress -> phase (hidden / active / done) -> fade-out timer -->
<script setup lang="ts">
/**
 * Thin page-top loading bar. `active` shows it; when `active` turns false the bar fades out (.is-done)
 * and is hidden after `fadeMs`. Without `value` it is indeterminate.
 * Classes: progress.oc-top-progress(--success/--warning/--danger/--brand/--lg/--static), .is-done, [hidden]
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    active?: boolean
    value?: number
    max?: number
    tone?: 'default' | 'success' | 'warning' | 'danger' | 'brand'
    large?: boolean
    /** In the normal flow (inside a card) instead of fixed at the top. */
    static?: boolean
    fadeMs?: number
  }>(),
  { active: true, tone: 'default', fadeMs: 400, value: undefined, max: undefined },
)

const phase = ref<'hidden' | 'active' | 'done'>(props.active ? 'active' : 'hidden')
let timer: ReturnType<typeof setTimeout> | undefined

watch(
  () => props.active,
  (on) => {
    clearTimeout(timer)
    if (on) {
      phase.value = 'active'
      return
    }
    // Only fade out when the bar was visible.
    if (phase.value === 'hidden') return
    phase.value = 'done'
    timer = setTimeout(() => (phase.value = 'hidden'), props.fadeMs)
  },
)
onBeforeUnmount(() => clearTimeout(timer))

const classes = computed(() => [
  'oc-top-progress',
  props.tone !== 'default' && `oc-top-progress--${props.tone}`,
  props.large && 'oc-top-progress--lg',
  props.static && 'oc-top-progress--static',
  phase.value === 'done' && 'is-done',
])
</script>

<template>
  <progress :class="classes" :value="value" :max="max" :hidden="phase === 'hidden'"></progress>
</template>
