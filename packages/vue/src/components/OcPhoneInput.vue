<!-- File: packages/vue/src/components/OcPhoneInput.vue | Map: props + model -> split / group helpers -> template (dial select + tel input) -->
<script setup lang="ts">
/**
 * Phone field: dial code select + national number. v-model = full value without spaces ("+32470123456").
 * Same markup as packages/ui/snippets/phone-input.html. JS only groups digits ("470 12 34 56").
 * class/style stay on the frame, other attributes (id, name, placeholder, aria-*) go to the number input.
 * 0.18.0: a country may carry `format` ("### ## ## ##", one # per digit) or `groups` ([3, 2, 2, 2]); the defaults group
 * BE 470 12 34 56, NL/FR 6 12 34 56 78, DE 151 2345 6789. Without either: a group of 3, then pairs.
 */
import { computed, ref } from 'vue'
import { useAttrsSplit } from '../composables/useAttrsSplit'

export interface PhoneInputCountry {
  dial: string
  label: string
  /** 0.18.0: national grouping, one # per digit ("### ## ## ##"). */
  format?: string
  /** 0.18.0: the same as group sizes ([3, 2, 2, 2]); wins over `format`. */
  groups?: number[]
}

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{ countries?: PhoneInputCountry[]; defaultDial?: string; size?: 'sm' | 'md'; error?: boolean; disabled?: boolean; dialLabel?: string; dialName?: string }>(),
  {
    countries: () => [
      { dial: '+32', label: 'BE +32', format: '### ## ## ##' },
      { dial: '+31', label: 'NL +31', format: '# ## ## ## ##' },
      { dial: '+33', label: 'FR +33', format: '# ## ## ## ##' },
      { dial: '+49', label: 'DE +49', format: '### #### ####' },
    ],
    size: 'md',
    dialLabel: 'Country code',
  },
)
const model = defineModel<string>({ default: '' })
/** v-model:dial: the chosen dial code on its own ("+31"); wins over the code in the value. */
const dialModel = defineModel<string>('dial')
const { root, control } = useAttrsSplit()

// Longest dial code that the value starts with, e.g. "+32" from "+32470...".
const parsed = computed(() => {
  const match = [...props.countries].sort((a, b) => b.dial.length - a.dial.length).find((c) => model.value.startsWith(c.dial))
  return match ? { dial: match.dial, national: model.value.slice(match.dial.length) } : { dial: '', national: model.value.replace(/^\+/, '') }
})
// Remember the chosen dial code while the number is still empty.
const dialState = ref(dialModel.value || parsed.value.dial || props.defaultDial || props.countries[0]?.dial || '')
const dial = computed(() => dialModel.value || parsed.value.dial || dialState.value)

/** "470123456" -> "470 12 34 56": the groups of the chosen country (default: 3, then pairs); extra digits in pairs. */
const grouped = computed(() => {
  const d = parsed.value.national.replace(/\D/g, '')
  const country = props.countries.find((c) => c.dial === dial.value)
  const sizes = country?.groups?.length ? country.groups.filter((n) => n > 0) : (country?.format?.match(/#+/g) ?? []).map((r) => r.length)
  const parts: string[] = []
  let at = 0
  for (const size of sizes.length ? sizes : [3]) {
    if (at >= d.length) break
    parts.push(d.slice(at, at + size))
    at += size
  }
  parts.push(...(d.slice(at).match(/.{1,2}/g) ?? []))
  return parts.filter(Boolean).join(' ')
})

function emit(nextDial: string, national: string) {
  if (nextDial !== dial.value) dialModel.value = nextDial
  dialState.value = nextDial
  const digits = national.replace(/\D/g, '')
  model.value = digits ? nextDial + digits : ''
}
</script>

<template>
  <div v-bind="root" :class="['oc-phone-input', size === 'sm' && 'oc-phone-input--sm', error && 'oc-phone-input--error']">
    <select class="oc-phone-input-dial" :name="dialName" :aria-label="dialLabel" :value="dial" :disabled="disabled" @change="emit(($event.target as HTMLSelectElement).value, parsed.national)">
      <option v-for="c in countries" :key="c.dial" :value="c.dial">{{ c.label }}</option>
    </select>
    <input
      v-bind="control"
      class="oc-phone-input-number"
      type="tel"
      inputmode="tel"
      autocomplete="tel-national"
      :aria-invalid="error ? 'true' : undefined"
      :disabled="disabled"
      :value="grouped"
      @input="emit(dial, ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>
