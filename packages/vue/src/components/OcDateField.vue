<!-- File: packages/vue/src/components/OcDateField.vue | Map: v-model date -> ISO week label -> markup -->
<script setup lang="ts">
/** Native date input with a calendar icon zone and the ISO week. v-model is the YYYY-MM-DD string. */
import { computed } from 'vue'
import { isoWeek } from '../../../ui/src/form-extras.js'

const props = withDefaults(defineProps<{ week?: boolean; weekLabel?: string; size?: 'md' | 'sm'; id?: string }>(), { week: true, weekLabel: 'Week {week}', size: 'md' })
const model = defineModel<string>({ default: '' })
const label = computed(() => {
  const [y, m, d] = (model.value || '').split('-').map(Number)
  if (!props.week || !y) return ''
  const w = isoWeek(new Date(y, m - 1, d))
  return props.weekLabel.replace('{week}', String(w.week)).replace('{year}', String(w.year))
})
</script>

<template>
  <div :class="['oc-date-field', size === 'sm' && 'oc-date-field--sm']">
    <span class="oc-date-field__icon"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.11 0 2-.89 2-2V5a2 2 0 0 0-2-2m0 16H5V9h14zm0-12H5V5h14z" /></svg></span>
    <input :id="id" v-model="model" type="date" class="oc-date-field__input">
    <output v-if="week" class="oc-date-field__week">{{ label }}</output>
  </div>
</template>
