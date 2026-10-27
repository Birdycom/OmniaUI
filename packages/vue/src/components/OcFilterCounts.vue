<!-- File: packages/vue/src/components/OcFilterCounts.vue | Map: types + props -> template (fieldset radiogroup -> tile per view) -->
<script setup lang="ts">
/**
 * View filter tiles with counts (Active / Deleted / All). v-model = selected value.
 * Same markup as packages/ui/snippets/filter-counts.html. Classes: .oc-filter-counts(--compact), -item(--success/--destructive/--muted), -value, -label, -hint
 */
import { useUid } from '../composables/useUid'

export interface FilterCountsItem {
  value: string
  label: string
  count: number | string
  hint?: string
  /** Accent color of the tile; default primary. */
  tone?: 'primary' | 'success' | 'destructive' | 'muted'
  disabled?: boolean
}
defineProps<{
  options: FilterCountsItem[]
  /** aria-label of the group */
  label?: string
  compact?: boolean
  name?: string
}>()
const model = defineModel<string>()
const uid = useUid('oc-filter')
</script>

<template>
  <fieldset :class="['oc-filter-counts', compact && 'oc-filter-counts--compact']" role="radiogroup" :aria-label="label">
    <label v-for="option in options" :key="option.value" :class="['oc-filter-counts-item', option.tone && option.tone !== 'primary' && `oc-filter-counts-item--${option.tone}`]">
      <input v-model="model" type="radio" :name="name ?? uid" :value="option.value" :disabled="option.disabled" />
      <span class="oc-filter-counts-value">{{ option.count }}</span>
      <span class="oc-filter-counts-label">{{ option.label }}</span>
      <span v-if="option.hint" class="oc-filter-counts-hint">{{ option.hint }}</span>
    </label>
  </fieldset>
</template>
