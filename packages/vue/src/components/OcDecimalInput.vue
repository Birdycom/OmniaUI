<!-- File: packages/vue/src/components/OcDecimalInput.vue | Map: props + model -> locale helpers (parse / format, currency symbol) -> template (field, optional unit frame, 0.17.1: currency / percent affix frame) -->
<script setup lang="ts">
/**
 * Locale decimal field (1.234,56). v-model: number | null. Formats on blur with Intl.NumberFormat.
 * Same markup as packages/ui/snippets/decimal-input.html. All attributes (also class) go to the input.
 * currency (0.17.1): ISO code ("EUR"): its symbol inside the frame, before or after the value as the locale writes it
 * (€ 1.234,56 in nl-BE), and the decimals of that currency unless `decimals` is set. percent (0.17.1): "%" after the value
 * (the value is the number you see: 21 = 21 %). groupClass: class for the frame.
 */
import { computed, ref, watch } from 'vue'

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{ locale?: string; decimals?: number; unit?: string; currency?: string; percent?: boolean; groupClass?: string; alignStart?: boolean; error?: boolean }>(),
  { locale: 'nl-BE', decimals: undefined },
)

/** Symbol, side and decimals of the currency in the locale: ("nl-BE", "EUR") -> € before, 2 decimals. */
const money = computed(() => {
  if (!props.currency) return undefined
  const nf = new Intl.NumberFormat(props.locale, { style: 'currency', currency: props.currency, currencyDisplay: 'narrowSymbol' })
  const parts = nf.formatToParts(1)
  const at = parts.findIndex((p) => p.type === 'currency')
  return { symbol: parts[at]?.value ?? props.currency, before: at < parts.findIndex((p) => p.type === 'integer'), decimals: nf.resolvedOptions().maximumFractionDigits ?? 2 }
})
const digits = computed(() => props.decimals ?? money.value?.decimals ?? 2)
const symbol = computed(() => money.value?.symbol ?? (props.percent ? '%' : undefined))
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
  return n == null ? '' : new Intl.NumberFormat(props.locale, { minimumFractionDigits: digits.value, maximumFractionDigits: digits.value }).format(n)
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
  <div v-if="symbol" :class="['oc-input-group', 'oc-input-group--affix', error && 'oc-input-group--error', groupClass]" :data-currency="currency || undefined">
    <span v-if="money?.before" class="oc-input-addon" aria-hidden="true">{{ symbol }}</span>
    <input v-bind="$attrs" :class="['oc-input', 'oc-decimal-input', alignStart && 'oc-decimal-input--start']" type="text" inputmode="decimal" :aria-invalid="error ? 'true' : undefined" :value="text" @focus="focused = true" @input="onInput" @blur="onBlur" />
    <span v-if="!money?.before" class="oc-input-addon" aria-hidden="true">{{ symbol }}</span>
  </div>
  <div v-else-if="unit" :class="['oc-decimal-field', groupClass]">
    <input v-bind="$attrs" :class="['oc-input', 'oc-decimal-input', alignStart && 'oc-decimal-input--start']" type="text" inputmode="decimal" :aria-invalid="error ? 'true' : undefined" :value="text" @focus="focused = true" @input="onInput" @blur="onBlur" />
    <span class="oc-decimal-field-unit">{{ unit }}</span>
  </div>
  <input v-else v-bind="$attrs" :class="['oc-input', 'oc-decimal-input', alignStart && 'oc-decimal-input--start']" type="text" inputmode="decimal" :aria-invalid="error ? 'true' : undefined" :value="text" @focus="focused = true" @input="onInput" @blur="onBlur" />
</template>
