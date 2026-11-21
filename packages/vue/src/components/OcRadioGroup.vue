<script setup lang="ts">
/**
 * Radio group (fieldset). v-model = value of the checked radio. Pass `options` or put OcRadio items in the default slot.
 * `legend` renders a legend; `row` lays the items out horizontally; `card` makes the option items bordered cards.
 * `error`: message below the items (.oc-field-error); every radio gets aria-invalid and aria-describedby.
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

const props = defineProps<{ legend?: string; options?: RadioOption[]; name?: string; row?: boolean; card?: boolean; error?: string }>()
const model = defineModel<string | number>()
const uid = useUid('oc-radio')
const groupName = computed(() => props.name ?? uid)
const errorId = computed(() => (props.error ? `${groupName.value.replace(/[^\w-]/g, '')}-error` : undefined))
provide(radioGroupKey, { model, name: groupName, card: computed(() => !!props.card), errorId })
</script>

<template>
  <fieldset :class="['oc-radio-group', row && 'oc-radio-group--row']">
    <legend v-if="legend" class="oc-label">{{ legend }}</legend>
    <slot>
      <OcRadio v-for="o in options" :key="o.value" :value="o.value" :disabled="o.disabled" :description="o.description">{{ o.label }}</OcRadio>
    </slot>
    <p v-if="error" :id="errorId" class="oc-field-error" role="alert">{{ error }}</p>
  </fieldset>
</template>
