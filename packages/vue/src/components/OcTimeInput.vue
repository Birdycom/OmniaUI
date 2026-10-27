<!-- File: packages/vue/src/components/OcTimeInput.vue | Map: props + model -> format helpers -> template (text field + datalist) -->
<script setup lang="ts">
/**
 * 24h time field (HH:mm). v-model: "HH:mm" or "". `slots` fills a datalist with suggestions.
 * Same markup as packages/ui/snippets/time-input.html. JS only adds the colon ("0930" -> "09:30").
 * All attributes go to the input.
 */
import { useUid } from '../composables/useUid'

defineOptions({ inheritAttrs: false })
defineProps<{ slots?: string[]; error?: boolean; placeholder?: string }>()
const model = defineModel<string>({ default: '' })
const listId = useUid('oc-time')

/** Up to 4 digits with a colon after the first two. A picked datalist option is kept as is. */
function onInput(e: Event) {
  const input = e.target as HTMLInputElement
  const v = input.value
  const digits = v.replace(/\D/g, '').slice(0, 4)
  model.value = /^\d{2}:\d{2}$/.test(v) ? v : digits.length <= 2 ? digits : `${digits.slice(0, 2)}:${digits.slice(2)}`
  input.value = model.value
}

/** On blur: "9" -> "09:00", "930" -> "09:30". */
function onBlur() {
  const d = model.value.replace(/\D/g, '')
  if (d.length === 1 || d.length === 2) model.value = `${d.padStart(2, '0')}:00`
  else if (d.length === 3) model.value = `0${d[0]}:${d.slice(1)}`
}
</script>

<template>
  <input
    v-bind="$attrs"
    class="oc-input oc-time-input"
    type="text"
    inputmode="numeric"
    maxlength="5"
    pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
    :placeholder="placeholder ?? 'hh:mm'"
    :list="slots?.length ? listId : undefined"
    :aria-invalid="error ? 'true' : undefined"
    :value="model"
    @input="onInput"
    @blur="onBlur"
  />
  <datalist v-if="slots?.length" :id="listId">
    <option v-for="s in slots" :key="s" :value="s"></option>
  </datalist>
</template>
