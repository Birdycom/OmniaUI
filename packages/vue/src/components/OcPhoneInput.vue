<!-- File: packages/vue/src/components/OcPhoneInput.vue | Map: props + model -> split / group helpers -> template (dial select + tel input) -->
<script setup lang="ts">
/**
 * Phone field: dial code select + national number. v-model = full value without spaces ("+32470123456").
 * Same markup as packages/ui/snippets/phone-input.html. JS only groups digits ("470 12 34 56").
 * class/style stay on the frame, other attributes (id, name, placeholder, aria-*) go to the number input.
 */
import { computed, ref } from 'vue'
import { useAttrsSplit } from '../composables/useAttrsSplit'

export interface PhoneInputCountry {
  dial: string
  label: string
}

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{ countries?: PhoneInputCountry[]; defaultDial?: string; size?: 'sm' | 'md'; error?: boolean; disabled?: boolean; dialLabel?: string }>(),
  {
    countries: () => [
      { dial: '+32', label: 'BE +32' },
      { dial: '+31', label: 'NL +31' },
      { dial: '+33', label: 'FR +33' },
      { dial: '+49', label: 'DE +49' },
    ],
    size: 'md',
    dialLabel: 'Country code',
  },
)
const model = defineModel<string>({ default: '' })
const { root, control } = useAttrsSplit()

// Longest dial code that the value starts with, e.g. "+32" from "+32470...".
const parsed = computed(() => {
  const match = [...props.countries].sort((a, b) => b.dial.length - a.dial.length).find((c) => model.value.startsWith(c.dial))
  return match ? { dial: match.dial, national: model.value.slice(match.dial.length) } : { dial: '', national: model.value.replace(/^\+/, '') }
})
// Remember the chosen dial code while the number is still empty.
const dialState = ref(parsed.value.dial || props.defaultDial || props.countries[0]?.dial || '')
const dial = computed(() => parsed.value.dial || dialState.value)

/** "470123456" -> "470 12 34 56": a group of 3, then pairs. */
const grouped = computed(() => {
  const d = parsed.value.national.replace(/\D/g, '')
  return [d.slice(0, 3), ...(d.slice(3).match(/.{1,2}/g) ?? [])].filter(Boolean).join(' ')
})

function emit(nextDial: string, national: string) {
  dialState.value = nextDial
  const digits = national.replace(/\D/g, '')
  model.value = digits ? nextDial + digits : ''
}
</script>

<template>
  <div v-bind="root" :class="['oc-phone-input', size === 'sm' && 'oc-phone-input--sm', error && 'oc-phone-input--error']">
    <select class="oc-phone-input-dial" :aria-label="dialLabel" :value="dial" :disabled="disabled" @change="emit(($event.target as HTMLSelectElement).value, parsed.national)">
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
