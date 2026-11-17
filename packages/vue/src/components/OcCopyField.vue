<script setup lang="ts">
/**
 * Read-only monospace value with a copy button. Copies via navigator.clipboard and
 * adds .is-copied for 2 seconds. Emits `copy` with the value. display (true | 'lg'): large centred code; group: show it
 * in groups of n (the raw value is copied); caption (or slot `caption`): a line under the code.
 */
import { computed, onBeforeUnmount, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    value: string
    label?: string
    buttonLabel?: string
    display?: boolean | 'lg'
    group?: number
    caption?: string
  }>(),
  { label: 'Value', buttonLabel: 'Copy' },
)
const emit = defineEmits<{ copy: [value: string] }>()

const shown = computed(() => (props.group && props.group > 0 ? props.value.match(new RegExp(`.{1,${props.group}}`, 'gu'))?.join(' ') ?? props.value : props.value))
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
  <div :class="['oc-copy-field', display && 'oc-copy-field--display', display === 'lg' && 'oc-copy-field--lg']" :style="display ? { '--oc-copy-chars': String(shown.length) } : undefined">
    <input class="oc-copy-field-value" type="text" readonly :value="shown" :aria-label="label" />
    <button :class="['oc-copy-field-button', copied && 'is-copied']" type="button" :data-copy="group ? value : undefined" @click="copy">{{ buttonLabel }}</button>
    <p v-if="caption || $slots.caption" class="oc-copy-field-caption"><slot name="caption">{{ caption }}</slot></p>
  </div>
</template>
