<script setup lang="ts">
/**
 * Form field: label, control (default slot), description and error.
 * The slot receives { id, describedBy, invalid, required } so the control can be wired:
 *   <OcFormField label="Email" description="..." v-slot="f"><OcInput :id="f.id" :aria-describedby="f.describedBy" /></OcFormField>
 * Classes: .oc-field(--horizontal), .oc-field-label, .oc-field-description, .oc-field-error
 * 0.17.0: `tooltip` (info icon after the label; slot `tooltip` for rich content), `required` (mark after the label; bind
 * f.required on the control), `labelTrailing` (or slot `label-trailing`: content at the end of the label row), `errorKey`
 * (data-error-key + `<errorKey>-error` as the error id), `hideLabel` (screen readers only), `variant="ledger"`, `module`.
 * An OcInput with validationType inside reports its blur check: the field shows its validationMessage when `error` is empty.
 */
import { computed, provide, ref, useSlots } from 'vue'
import { useUid } from '../composables/useUid'
import { fieldContextKey } from '../composables/keys-d2'
import OcWebicon from './OcWebicon.vue'

const props = withDefaults(
  defineProps<{
    label?: string
    description?: string
    error?: string
    /** id of the control; generated when omitted */
    for?: string
    horizontal?: boolean
    /** Help text behind an info icon after the label */
    tooltip?: string
    /** Accessible name of the info icon */
    tooltipLabel?: string
    /** Required mark after the label */
    required?: boolean
    /** Text at the end of the label row */
    labelTrailing?: string
    /** Key in the error bag: data-error-key and the id of the error */
    errorKey?: string
    /** Label for screen readers only */
    hideLabel?: boolean
    variant?: 'ledger'
    /** Module colour name: data-module */
    module?: string
  }>(),
  { tooltipLabel: 'More information' },
)
const slots = useSlots()
const generated = useUid('oc-field')
const id = computed(() => props.for ?? generated)
const validation = ref<string | null>(null)
provide(fieldContextKey, { report: (valid, message) => { validation.value = valid ? null : (message ?? 'Invalid value') } })
const shownError = computed(() => props.error || validation.value || '')
const helpId = computed(() => `${id.value}-help`)
const errorId = computed(() => `${props.errorKey ?? id.value}-error`)
const tipId = computed(() => `${id.value}-tip`)
const describedBy = computed(() => {
  const ids = [props.description && helpId.value, shownError.value && errorId.value].filter(Boolean)
  return ids.length ? ids.join(' ') : undefined
})
const hasTip = computed(() => !!props.tooltip || !!slots.tooltip)
const row = computed(() => hasTip.value || !!props.labelTrailing || !!slots['label-trailing'])
const labelClass = computed(() => ['oc-field-label', props.hideLabel && 'oc-visually-hidden'])
</script>

<template>
  <div
    :class="['oc-field', horizontal && 'oc-field--horizontal', variant === 'ledger' && 'oc-field--ledger']"
    :data-module="module"
    :data-error-key="errorKey"
  >
    <div v-if="row" class="oc-field-label-row">
      <label v-if="label || $slots.label" :class="labelClass" :for="id"><slot name="label">{{ label }}</slot><span v-if="required" class="oc-field-required" aria-hidden="true">*</span></label>
      <span v-if="hasTip" class="oc-tooltip oc-field-tooltip-wrap" :data-tooltip="$slots.tooltip ? undefined : tooltip">
        <button type="button" class="oc-field-tooltip" :aria-label="tooltipLabel" :aria-describedby="tipId">
          <OcWebicon name="mdi:information-outline" bare fallback="iconify" />
        </button>
        <span v-if="$slots.tooltip" :id="tipId" class="oc-tooltip__content" role="tooltip"><slot name="tooltip" /></span>
        <span v-else :id="tipId" class="oc-visually-hidden">{{ tooltip }}</span>
      </span>
      <span v-if="labelTrailing || $slots['label-trailing']" class="oc-field-label-trailing"><slot name="label-trailing">{{ labelTrailing }}</slot></span>
    </div>
    <label v-else-if="label || $slots.label" :class="labelClass" :for="id"><slot name="label">{{ label }}</slot><span v-if="required" class="oc-field-required" aria-hidden="true">*</span></label>
    <slot :id="id" :described-by="describedBy" :invalid="!!shownError" :required="required || undefined" />
    <p v-if="description" :id="helpId" class="oc-field-description">{{ description }}</p>
    <p v-if="shownError" :id="errorId" class="oc-field-error" role="alert">{{ shownError }}</p>
  </div>
</template>
