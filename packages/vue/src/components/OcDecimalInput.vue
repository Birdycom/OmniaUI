<!-- File: packages/vue/src/components/OcDecimalInput.vue | Map: props + model -> locale helpers (parse / format) -> template (field, optional unit frame) -->
<script setup lang="ts">
/**
 * Locale decimal field (1.234,56). v-model: number | null. Formats on blur with Intl.NumberFormat.
 * Same markup as packages/ui/snippets/decimal-input.html. All attributes (also class) go to the input.
 */
import { ref, watch } from 'vue'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ locale?: string; decimals?: number; unit?: string; alignStart?: boolean; error?: boolean }>(), {
  locale: 'nl-BE',
  decimals: 2,
})
const model = defineModel<number | null>({ default: null })

/** Group and decimal separator of the locale, e.g. nl-BE -> "." and ",". */
function separators() {
  const parts = new Intl.NumberFormat(props.locale).formatToParts(1234.5)
  return { group: parts.find((p) => p.type === 'group')?.value ?? ',', decimal: parts.find((p) => p.type === 'decimal')?.value ?? '.' }
}
function parse(text: string): number | null {
  const { group, decimal } = separators()
  const clean = text.trim().split(group).join('').replace(decimal, '.').replace(/\s/g, '')
  const n = Number(clean)
  return clean && Number.isFinite(n) ? n : null
}
function format(n: number | null): string {
  return n == null ? '' : new Intl.NumberFormat(props.locale, { minimumFractionDigits: props.decimals, maximumFractionDigits: props.decimals }).format(n)
}

const text = ref(format(model.value))
const focused = ref(false)
// Show outside changes, but never while the user is typing.
watch(model, (n) => { if (!focused.value) text.value = format(n) })

function onInput(e: Event) {
  text.value = (e.target as HTMLInputElement).value
  model.value = parse(text.value)
}
function onBlur() {
  focused.value = false
  const n = parse(text.value)
  if (n != null || !text.value.trim()) text.value = format(n)
}
</script>

<template>
  <div v-if="unit" class="oc-decimal-field">
    <input v-bind="$attrs" :class="['oc-input', 'oc-decimal-input', alignStart && 'oc-decimal-input--start']" type="text" inputmode="decimal" :aria-invalid="error ? 'true' : undefined" :value="text" @focus="focused = true" @input="onInput" @blur="onBlur" />
    <span class="oc-decimal-field-unit">{{ unit }}</span>
  </div>
  <input v-else v-bind="$attrs" :class="['oc-input', 'oc-decimal-input', alignStart && 'oc-decimal-input--start']" type="text" inputmode="decimal" :aria-invalid="error ? 'true' : undefined" :value="text" @focus="focused = true" @input="onInput" @blur="onBlur" />
</template>
