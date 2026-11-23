<script setup lang="ts">
/**
 * Warning panel with a code grid plus "copy all" and "download .txt" actions (handled here), and optionally "print"
 * (only the codes). Emits `copy`, `download` and `print`. Slot: actions (replaces the buttons).
 * 0.17.0: copiedLabel (feedback on the copy button and in a live region), print / printLabel, icons (Omnia webicons on
 * the buttons and at the warning; default true).
 */
import { onBeforeUnmount, ref } from 'vue'
import OcWebicon from './OcWebicon.vue'

const props = withDefaults(
  defineProps<{
    codes: string[]
    title?: string
    warning?: string
    copyLabel?: string
    copiedLabel?: string
    downloadLabel?: string
    print?: boolean
    printLabel?: string
    filename?: string
    icons?: boolean
  }>(),
  {
    title: 'Recovery codes',
    warning: 'Store these codes somewhere safe. Each code works once.',
    copyLabel: 'Copy all',
    copiedLabel: 'Copied',
    downloadLabel: 'Download .txt',
    print: false,
    printLabel: 'Print',
    filename: 'recovery-codes.txt',
    icons: true,
  },
)
const emit = defineEmits<{ copy: []; download: []; print: [] }>()
const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

async function copyAll() {
  try {
    await navigator.clipboard.writeText(props.codes.join('\n'))
  } catch {
    return
  }
  copied.value = true
  emit('copy')
  clearTimeout(timer)
  timer = setTimeout(() => (copied.value = false), 2000)
}

function download() {
  const url = URL.createObjectURL(new Blob([props.codes.join('\n') + '\n'], { type: 'text/plain' }))
  const a = document.createElement('a')
  a.href = url
  a.download = props.filename
  a.click()
  URL.revokeObjectURL(url)
  emit('download')
}

const esc = (text: string) => text.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`)

/** Print only the codes: a hidden iframe with the title and the list. */
function printCodes() {
  const frame = document.createElement('iframe')
  frame.setAttribute('aria-hidden', 'true')
  frame.style.cssText = 'position:fixed;inline-size:0;block-size:0;border:0;inset:auto auto 0 0'
  frame.srcdoc = `<!doctype html><meta charset="utf-8"><title>${esc(props.title)}</title><style>body{font:14px ui-monospace,Consolas,monospace;margin:2cm}h1{font:600 16px system-ui,sans-serif}ul{list-style:none;padding:0;columns:2}</style><h1>${esc(props.title)}</h1><ul>${props.codes.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>`
  frame.addEventListener('load', () => {
    frame.contentWindow?.print()
    setTimeout(() => frame.remove(), 1000)
  })
  document.body.append(frame)
  emit('print')
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="oc-recovery-codes">
    <h3 class="oc-recovery-codes-title">{{ title }}</h3>
    <p class="oc-recovery-codes-warning"><OcWebicon v-if="icons" name="mdi:alert-outline" bare fallback="iconify" /><span>{{ warning }}</span></p>
    <ul class="oc-recovery-codes-list">
      <li v-for="code in codes" :key="code">{{ code }}</li>
    </ul>
    <div class="oc-recovery-codes-actions">
      <slot name="actions">
        <button :class="['oc-btn oc-btn--outline oc-btn--sm', copied && 'is-copied']" type="button" @click="copyAll">
          <OcWebicon v-if="icons" :name="copied ? 'mdi:check' : 'mdi:content-copy'" bare fallback="iconify" />{{ copied ? copiedLabel : copyLabel }}
        </button>
        <button class="oc-btn oc-btn--outline oc-btn--sm" type="button" @click="download"><OcWebicon v-if="icons" name="mdi:download" bare fallback="iconify" />{{ downloadLabel }}</button>
        <button v-if="print" class="oc-btn oc-btn--outline oc-btn--sm" type="button" @click="printCodes"><OcWebicon v-if="icons" name="mdi:printer" bare fallback="iconify" />{{ printLabel }}</button>
      </slot>
    </div>
    <span class="oc-recovery-codes-status oc-visually-hidden" role="status" aria-live="polite">{{ copied ? copiedLabel : '' }}</span>
  </div>
</template>
