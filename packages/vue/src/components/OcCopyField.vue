<script setup lang="ts">
/**
 * Read-only monospace value with a copy button. Copies via navigator.clipboard and
 * adds .is-copied for 2 seconds. Emits `copy` with the value.
 */
import { onBeforeUnmount, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    value: string
    label?: string
    buttonLabel?: string
  }>(),
  { label: 'Value', buttonLabel: 'Copy' },
)
const emit = defineEmits<{ copy: [value: string] }>()

const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

async function copy() {
  await navigator.clipboard.writeText(props.value)
  copied.value = true
  emit('copy', props.value)
  clearTimeout(timer)
  timer = setTimeout(() => (copied.value = false), 2000)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="oc-copy-field">
    <input class="oc-copy-field-value" type="text" readonly :value="value" :aria-label="label" />
    <button :class="['oc-copy-field-button', copied && 'is-copied']" type="button" @click="copy">{{ buttonLabel }}</button>
  </div>
</template>
