<!-- File: packages/vue/src/components/OcInput.vue | Map: props (error, variant, module, mask, validationType) -> live mask (caret kept) -> blur validation -> input.oc-input -->
<script setup lang="ts">
/**
 * Text input. v-model. `error` sets .oc-input--error + aria-invalid. Any native attribute falls through.
 * 0.17.0: `variant="ledger"` (compact bookkeeping look), `module` (data-module), `mask` ("iban" | "bic" | "vat" | "phone" or a
 * pattern: 9 = digit, A = letter, * = any) formats while typing, `validationType` checks on blur (aria-invalid +
 * .oc-input--error, event `validate(valid, value)`); inside an OcFormField the field shows `validationMessage`.
 * Mask and validation are the helpers of packages/ui/src/input-mask.js.
 */
import { computed, inject, ref } from 'vue'
import { applyMask, caretFor, countBefore, validate } from '../../../ui/src/input-mask.js'
import { fieldContextKey } from '../composables/keys-d2'

const props = defineProps<{
  error?: boolean
  /** Compact bookkeeping look (.oc-input--ledger) */
  variant?: 'ledger'
  /** Module colour name: data-module */
  module?: string
  /** "iban" | "bic" | "vat" | "phone" or a pattern (9 = digit, A = letter, * = any) */
  mask?: string
  /** Checked on blur; an empty value is valid (use required) */
  validationType?: 'iban' | 'bic' | 'vat' | 'email' | 'phone'
  /** Message an OcFormField shows for an invalid value */
  validationMessage?: string
}>()
const emit = defineEmits<{ validate: [valid: boolean, value: string] }>()
const model = defineModel<string | number>()
const field = inject(fieldContextKey, null)
const invalid = ref(false)
const failed = computed(() => props.error || invalid.value)

function report(valid: boolean, value: string) {
  invalid.value = !valid
  emit('validate', valid, value)
  field?.report(valid, props.validationMessage)
}
function onInput(e: Event) {
  const input = e.target as HTMLInputElement
  if (props.mask) {
    const before = input.value
    const caret = input.selectionStart ?? before.length
    const next = applyMask(props.mask, before)
    if (next !== before) {
      input.value = next
      const at = caret >= before.length ? next.length : caretFor(next, countBefore(before, caret))
      try { input.setSelectionRange(at, at) } catch { /* no selection API for this input type */ }
    }
    model.value = next
  }
  // Once a value was found wrong, the error goes away as soon as it is right.
  if (props.validationType && invalid.value && validate(props.validationType, input.value)) report(true, input.value)
}
function onBlur(e: Event) {
  if (props.validationType) {
    const value = (e.target as HTMLInputElement).value
    report(validate(props.validationType, value), value)
  }
}
</script>

<template>
  <input
    v-model="model"
    :class="['oc-input', failed && 'oc-input--error', variant === 'ledger' && 'oc-input--ledger']"
    :aria-invalid="failed ? 'true' : undefined"
    :data-module="module"
    @input="onInput"
    @blur="onBlur"
  />
</template>
