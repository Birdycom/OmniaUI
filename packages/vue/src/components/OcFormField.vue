<script setup lang="ts">
/**
 * Form field: label, control (default slot), description and error.
 * The slot receives { id, describedBy, invalid } so the control can be wired:
 *   <OcFormField label="Email" description="..." v-slot="f"><OcInput :id="f.id" :aria-describedby="f.describedBy" /></OcFormField>
 * Classes: .oc-field(--horizontal), .oc-field-label, .oc-field-description, .oc-field-error
 */
import { computed } from 'vue'
import { useUid } from '../composables/useUid'

const props = defineProps<{
  label?: string
  description?: string
  error?: string
  /** id of the control; generated when omitted */
  for?: string
  horizontal?: boolean
}>()
const generated = useUid('oc-field')
const id = computed(() => props.for ?? generated)
const helpId = computed(() => `${id.value}-help`)
const errorId = computed(() => `${id.value}-error`)
const describedBy = computed(() => {
  const ids = [props.description && helpId.value, props.error && errorId.value].filter(Boolean)
  return ids.length ? ids.join(' ') : undefined
})
</script>

<template>
  <div :class="['oc-field', horizontal && 'oc-field--horizontal']">
    <label v-if="label || $slots.label" class="oc-field-label" :for="id"><slot name="label">{{ label }}</slot></label>
    <slot :id="id" :described-by="describedBy" :invalid="!!error" />
    <p v-if="description" :id="helpId" class="oc-field-description">{{ description }}</p>
    <p v-if="error" :id="errorId" class="oc-field-error" role="alert">{{ error }}</p>
  </div>
</template>
