<script setup lang="ts">
/**
 * Radio group (fieldset). v-model = value of the checked radio. Pass `options` or put OcRadio items in the default slot.
 * `legend` renders a legend; `row` lays the items out horizontally; `card` makes the option items bordered cards.
 * Classes: .oc-radio-group(--row)
 */
import { computed, provide } from 'vue'
import { useUid } from '../composables/useUid'
import { radioGroupKey } from '../composables/keys'
import OcRadio from './OcRadio.vue'

export interface RadioOption {
  value: string | number
  label: string
  description?: string
  disabled?: boolean
}

const props = defineProps<{ legend?: string; options?: RadioOption[]; name?: string; row?: boolean; card?: boolean }>()
const model = defineModel<string | number>()
const uid = useUid('oc-radio')
provide(radioGroupKey, { model, name: computed(() => props.name ?? uid), card: computed(() => !!props.card) })
</script>

<template>
  <fieldset :class="['oc-radio-group', row && 'oc-radio-group--row']">
    <legend v-if="legend" class="oc-label">{{ legend }}</legend>
    <slot>
      <OcRadio v-for="o in options" :key="o.value" :value="o.value" :disabled="o.disabled" :description="o.description">{{ o.label }}</OcRadio>
    </slot>
  </fieldset>
</template>
