<!-- File: packages/vue/src/components/OcChipFilter.vue | Map: types + props -> template (group -> chip label per option) -->
<script setup lang="ts">
/**
 * Rounded filter chips. `multiple`: checkboxes, v-model = string[]. Otherwise radios, v-model = string.
 * Same markup as packages/ui/snippets/chip-filter.html. Classes: .oc-chip-filter(--sm/--scroll), -item, -count
 */
import { useUid } from '../composables/useUid'

export interface ChipFilterItem {
  value: string
  label: string
  count?: number
  disabled?: boolean
}
const props = defineProps<{
  options: ChipFilterItem[]
  multiple?: boolean
  /** aria-label of the group */
  label?: string
  size?: 'sm' | 'md'
  scroll?: boolean
  name?: string
}>()
const model = defineModel<string | string[]>()
const uid = useUid('oc-chip')

const isChecked = (v: string) => (Array.isArray(model.value) ? model.value.includes(v) : model.value === v)

/** Checkbox: add or remove the value (works when v-model starts undefined). Radio: replace it. */
function toggle(v: string) {
  if (!props.multiple) {
    model.value = v
    return
  }
  const list = Array.isArray(model.value) ? model.value : []
  model.value = list.includes(v) ? list.filter((x) => x !== v) : [...list, v]
}
</script>

<template>
  <div :class="['oc-chip-filter', size === 'sm' && 'oc-chip-filter--sm', scroll && 'oc-chip-filter--scroll']" :role="multiple ? 'group' : 'radiogroup'" :aria-label="label">
    <label v-for="option in options" :key="option.value" class="oc-chip-filter-item">
      <input :type="multiple ? 'checkbox' : 'radio'" :name="name ?? uid" :value="option.value" :checked="isChecked(option.value)" :disabled="option.disabled" @change="toggle(option.value)" />
      {{ option.label }}
      <span v-if="option.count != null" class="oc-chip-filter-count">{{ option.count }}</span>
    </label>
  </div>
</template>
