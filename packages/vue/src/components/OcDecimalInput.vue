<!-- File: packages/vue/src/components/OcDecimalInput.vue | Map: props + model -> locale helpers (parse / format, currency symbol) -> template (field, optional unit frame, 0.17.1: currency / percent affix frame) -->
<script setup lang="ts">
/**
 * Locale decimal field (1.234,56). v-model: number | null. Formats on blur with Intl.NumberFormat.
 * Same markup as packages/ui/snippets/decimal-input.html. All attributes (also class) go to the input.
 * currency (0.17.1): ISO code ("EUR"): its symbol inside the frame, before or after the value as the locale writes it
 * (€ 1.234,56 in nl-BE), and the decimals of that currency unless `decimals` is set. percent (0.17.1): "%" after the value
 * (the value is the number you see: 21 = 21 %). groupClass: class for the frame.
 * 0.18.0: the value is rounded to `decimals` (half away from zero: 1.005 -> 1.01); allowNegative (default true; false drops
 * the minus sign), integer (whole numbers: 0 decimals, no decimal mark, inputmode numeric).
 */
import { computed, ref, watch } from 'vue'

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{ locale?: string; decimals?: number; unit?: string; currency?: string; percent?: boolean; groupClass?: string; alignStart?: boolean; error?: boolean; allowNegative?: boolean; integer?: boolean }>(),
  { locale: 'nl-BE', decimals: undefined, allowNegative: true },
)

/** Symbol, side and decimals of the currency in the locale: ("nl-BE", "EUR") -> € before, 2 decimals. */
const money = computed(() => {
  if (!props.currency) return undefined
  const nf = new Intl.NumberFormat(props.locale, { style: 'currency', currency: props.currency, currencyDisplay: 'narrowSymbol' })
  const parts = nf.formatToParts(1)
  const at = parts.findIndex((p) => p.type === 'currency')
  return { symbol: parts[at]?.value ?? props.currency, before: at < parts.findIndex((p) => p.type === 'integer'), decimals: nf.resolvedOptions().maximumFractionDigits ?? 2 }
})
const digits = computed(() => (props.integer ? 0 : (props.decimals ?? money.value?.decimals ?? 2)))
const mode = computed(() => (props.integer ? 'numeric' : 'decimal'))
const MINUS = String.fromCharCode(0x2212)
const symbol = computed(() => money.value?.symbol ?? (props.percent ? '%' : undefined))
const model = defineModel<number | null>({ default: null })

/** Group and decimal separator of the locale, e.g. nl-BE -> "." and ",". */
function separators() {
  const parts = new Intl.NumberFormat(props.locale).formatToParts(1234.5)
  return { group: parts.find((p) => p.type === 'group')?.value ?? ',', decimal: parts.find((p) => p.type === 'decimal')?.value ?? '.' }
}
function parse(text: string): number | null {
  const { group, decimal } = separators()
  const clean = text.trim().split(group).join('').replace(decimal, '.').replace(/\s/g, '').split(MINUS).join('-')
  const n = Number(clean)
  return clean && Number.isFinite(n) ? n : null
}
/** Half away from zero on the digits you see (1.005 -> 1.01, 2.675 -> 2.68), not on the binary value. */
function round(n: number, d: number): number {
  if (!Number.isFinite(n)) return n
  const abs = Math.abs(n)
  const t = String(abs)
  const up = t.includes('e') ? Math.round(abs * 10 ** d) : Math.round(Number(`${t}e${d}`))
  const out = (n < 0 ? -1 : 1) * Number(`${up}e-${d}`)
  return out === 0 ? 0 : out
}
/** The number of a text, rounded to the decimals of the field (and without sign when negatives are off). */
function read(text: string): number | null {
  const n = parse(text)
  return n == null ? null : round(props.allowNegative ? n : Math.abs(n), digits.value)
}
function format(n: number | null): string {
  return n == null ? '' : new Intl.NumberFormat(props.locale, { minimumFractionDigits: digits.value, maximumFractionDigits: digits.value }).format(round(n, digits.value))
}
/** The typed text without the characters this field does not take (minus, decimal mark). */
function cleanText(raw: string): string {
  let out = props.allowNegative ? raw : raw.split('-').join('').split(MINUS).join('')
  if (props.integer) out = out.split(separators().decimal).join('')
  return out
}

const text = ref(format(model.value))
const focused = ref(false)
// Show outside changes, but never while the user is typing.
watch(model, (n) => { if (!focused.value) text.value = format(n) })

function onInput(e: Event) {
  const el = e.target as HTMLInputElement
  const raw = cleanText(el.value)
  if (raw !== el.value) el.value = raw
  text.value = raw
  model.value = read(raw)
}
function onBlur() {
  focused.value = false
  const n = read(text.value)
  if (n != null || !text.value.trim()) text.value = format(n)
}
</script>

<template>
  <div v-if="symbol" :class="['oc-input-group', 'oc-input-group--affix', error && 'oc-input-group--error', groupClass]" :data-currency="currency || undefined">
    <span v-if="money?.before" class="oc-input-addon" aria-hidden="true">{{ symbol }}</span>
    <input v-bind="$attrs" :class="['oc-input', 'oc-decimal-input', alignStart && 'oc-decimal-input--start']" type="text" :inputmode="mode" :aria-invalid="error ? 'true' : undefined" :value="text" @focus="focused = true" @input="onInput" @blur="onBlur" />
    <span v-if="!money?.before" class="oc-input-addon" aria-hidden="true">{{ symbol }}</span>
  </div>
  <div v-else-if="unit" :class="['oc-decimal-field', groupClass]">
    <input v-bind="$attrs" :class="['oc-input', 'oc-decimal-input', alignStart && 'oc-decimal-input--start']" type="text" :inputmode="mode" :aria-invalid="error ? 'true' : undefined" :value="text" @focus="focused = true" @input="onInput" @blur="onBlur" />
    <span class="oc-decimal-field-unit">{{ unit }}</span>
  </div>
  <input v-else v-bind="$attrs" :class="['oc-input', 'oc-decimal-input', alignStart && 'oc-decimal-input--start']" type="text" :inputmode="mode" :aria-invalid="error ? 'true' : undefined" :value="text" @focus="focused = true" @input="onInput" @blur="onBlur" />
</template>
