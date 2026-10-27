<script setup lang="ts">
/**
 * Warning panel with a code grid plus "copy all" and "download .txt" actions (handled here).
 * Emits `copy` and `download`. Slot: actions (replaces the two buttons).
 */
const props = withDefaults(
  defineProps<{
    codes: string[]
    title?: string
    warning?: string
    copyLabel?: string
    downloadLabel?: string
    filename?: string
  }>(),
  {
    title: 'Recovery codes',
    warning: 'Store these codes somewhere safe. Each code works once.',
    copyLabel: 'Copy all',
    downloadLabel: 'Download .txt',
    filename: 'recovery-codes.txt',
  },
)
const emit = defineEmits<{ copy: []; download: [] }>()

async function copyAll() {
  await navigator.clipboard.writeText(props.codes.join('\n'))
  emit('copy')
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
</script>

<template>
  <div class="oc-recovery-codes">
    <h3 class="oc-recovery-codes-title">{{ title }}</h3>
    <p class="oc-recovery-codes-warning">{{ warning }}</p>
    <ul class="oc-recovery-codes-list">
      <li v-for="code in codes" :key="code">{{ code }}</li>
    </ul>
    <div class="oc-recovery-codes-actions">
      <slot name="actions">
        <button class="oc-btn oc-btn--outline oc-btn--sm" type="button" @click="copyAll">{{ copyLabel }}</button>
        <button class="oc-btn oc-btn--outline oc-btn--sm" type="button" @click="download">{{ downloadLabel }}</button>
      </slot>
    </div>
  </div>
</template>
