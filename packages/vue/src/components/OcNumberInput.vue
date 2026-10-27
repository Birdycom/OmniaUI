<!-- File: packages/vue/src/components/OcNumberInput.vue | Map: props + model -> step helper -> template (minus, number field, plus) -->
<script setup lang="ts">
/**
 * Number field with - / + buttons. v-model: number | null. Buttons disable themselves at min / max.
 * Same markup as packages/ui/snippets/number-input.html (no page script needed here).
 * class/style stay on the frame, other attributes (id, name, aria-label) go to the input.
 */
import { useAttrsSplit } from '../composables/useAttrsSplit'

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{ min?: number; max?: number; step?: number; size?: 'sm' | 'md'; block?: boolean; error?: boolean; disabled?: boolean; decrementLabel?: string; incrementLabel?: string }>(),
  { step: 1, size: 'md', decrementLabel: 'Decrease', incrementLabel: 'Increase' },
)
const model = defineModel<number | null>({ default: null })
const { root, control } = useAttrsSplit()

/** Add one step, keep the result inside min/max and drop float noise (0.1 + 0.2). */
function stepBy(dir: 1 | -1) {
  const next = Math.round(((model.value ?? props.min ?? 0) + dir * props.step) * 1e6) / 1e6
  model.value = Math.min(props.max ?? Infinity, Math.max(props.min ?? -Infinity, next))
}

function onInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value
  model.value = raw === '' ? null : Number(raw)
}
</script>

<template>
  <div v-bind="root" :class="['oc-number-input', size === 'sm' && 'oc-number-input--sm', block && 'oc-number-input--block', error && 'oc-number-input--error']">
    <button class="oc-number-input-step" type="button" :aria-label="decrementLabel" :disabled="disabled || (min != null && model != null && model <= min)" @click="stepBy(-1)">&minus;</button>
    <input
      v-bind="control"
      class="oc-number-input-field"
      type="number"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :aria-invalid="error ? 'true' : undefined"
      :value="model ?? ''"
      @input="onInput"
    />
    <button class="oc-number-input-step" type="button" :aria-label="incrementLabel" :disabled="disabled || (max != null && model != null && model >= max)" @click="stepBy(1)">+</button>
  </div>
</template>
