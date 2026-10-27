<!-- File: packages/vue/src/components/OcColorSelect.vue | Map: types + props -> template (fieldset radiogroup -> label per color) -->
<script setup lang="ts">
/** Pick one color from swatches. v-model = selected value. Classes: .oc-color-select(--list/--sm), -option, -swatch, -name */
import { useUid } from '../composables/useUid'

export interface ColorSelectItem {
  value: string
  label: string
  /** CSS color, use Omnia tokens: "var(--color-red-70)". */
  color: string
  disabled?: boolean
}
defineProps<{
  options: ColorSelectItem[]
  /** aria-label of the group */
  label?: string
  list?: boolean
  size?: 'sm' | 'md'
  name?: string
}>()
const model = defineModel<string>()
const uid = useUid('oc-color')
</script>

<template>
  <fieldset :class="['oc-color-select', list && 'oc-color-select--list', size === 'sm' && 'oc-color-select--sm']" role="radiogroup" :aria-label="label">
    <label v-for="option in options" :key="option.value" class="oc-color-select-option" :style="{ '--oc-swatch': option.color }">
      <input v-model="model" type="radio" :name="name ?? uid" :value="option.value" :disabled="option.disabled" />
      <span class="oc-color-select-swatch"></span>
      <span class="oc-color-select-name">{{ option.label }}</span>
    </label>
  </fieldset>
</template>
