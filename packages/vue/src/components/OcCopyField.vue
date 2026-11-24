<script setup lang="ts">
/**
 * Read-only monospace value with a copy button. Copies via navigator.clipboard and
 * adds .is-copied for 2 seconds. Emits `copy` with the value. display (true | 'lg'): large centred code; group: show it
 * in groups of n (the raw value is copied); caption (or slot `caption`): a line under the code.
 * 0.17.0: masked (a secret as dots with a show/hide toggle, aria-pressed), wrap (long values break over lines),
 * copiedLabel (feedback on the button and in a live region), ariaLabel (accessible name without a visible label,
 * default "Value"), revealLabel (name of the toggle), icon (mdi:content-copy on the button, default true).
 */
import { computed, onBeforeUnmount, ref } from 'vue'
import OcWebicon from './OcWebicon.vue'
import { useUid } from '../composables/useUid'

const props = withDefaults(
  defineProps<{
    value: string
    label?: string
    ariaLabel?: string
    buttonLabel?: string
    copiedLabel?: string
    display?: boolean | 'lg'
    group?: number
    caption?: string
    masked?: boolean
    revealLabel?: string
    wrap?: boolean
    /** 0.18.0: the field stretches with a narrow column (.oc-copy-field--block). */
    block?: boolean
    icon?: boolean
  }>(),
  { buttonLabel: 'Copy', copiedLabel: 'Copied', revealLabel: 'Show value', icon: true },
)
const emit = defineEmits<{ copy: [value: string] }>()

const shown = computed(() => (props.group && props.group > 0 ? props.value.match(new RegExp(`.{1,${props.group}}`, 'gu'))?.join(' ') ?? props.value : props.value))
const name = computed(() => props.ariaLabel ?? props.label ?? 'Value')
const wraps = computed(() => props.wrap && !props.masked)
const valueId = useUid('oc-copy')
const copied = ref(false)
const revealed = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

async function copy() {
  try {
    await navigator.clipboard.writeText(props.value)
  } catch {
    return
  }
  copied.value = true
  emit('copy', props.value)
  clearTimeout(timer)
  timer = setTimeout(() => (copied.value = false), 2000)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div :class="['oc-copy-field', display && 'oc-copy-field--display', display === 'lg' && 'oc-copy-field--lg', wraps && 'oc-copy-field--wrap', block && 'oc-copy-field--block']" :style="display ? { '--oc-copy-chars': String(shown.length) } : undefined">
    <output v-if="wraps" :id="valueId" class="oc-copy-field-value" :aria-label="name">{{ shown }}</output>
    <input v-else :id="valueId" class="oc-copy-field-value" :type="masked && !revealed ? 'password' : 'text'" readonly :value="shown" :aria-label="name" autocomplete="off" />
    <button v-if="masked" class="oc-copy-field-toggle" type="button" :aria-pressed="revealed ? 'true' : 'false'" :aria-controls="valueId" :aria-label="revealLabel" @click="revealed = !revealed">
      <OcWebicon :name="revealed ? 'mdi:eye-off' : 'mdi:eye'" bare fallback="iconify" />
    </button>
    <button :class="['oc-copy-field-button', copied && 'is-copied']" type="button" :data-copy="group ? value : undefined" @click="copy">
      <OcWebicon v-if="icon" :name="copied ? 'mdi:check' : 'mdi:content-copy'" bare fallback="iconify" />
      <span class="oc-copy-field-button-label">{{ copied ? copiedLabel : buttonLabel }}</span>
    </button>
    <span class="oc-copy-field-status oc-visually-hidden" role="status" aria-live="polite">{{ copied ? copiedLabel : '' }}</span>
    <p v-if="caption || $slots.caption" class="oc-copy-field-caption"><slot name="caption">{{ caption }}</slot></p>
  </div>
</template>
