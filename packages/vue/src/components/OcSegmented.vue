<script setup lang="ts">
/** Radio group as a pill switcher. v-model = selected value. Classes: .oc-segmented(--block/--sm), -item */
import { useUid } from '../composables/useUid'

export interface SegmentedOption {
  value: string
  label: string
}
defineProps<{
  options: SegmentedOption[]
  /** aria-label of the group */
  label?: string
  block?: boolean
  size?: 'sm' | 'md'
  name?: string
}>()
const model = defineModel<string>()
const uid = useUid('oc-segmented')
</script>

<template>
  <div :class="['oc-segmented', block && 'oc-segmented--block', size === 'sm' && 'oc-segmented--sm']" role="radiogroup" :aria-label="label">
    <label v-for="option in options" :key="option.value" class="oc-segmented-item">
      <input v-model="model" type="radio" :name="name ?? uid" :value="option.value" />
      {{ option.label }}
    </label>
  </div>
</template>
