<!-- File: packages/vue/src/components/OcCodeWindow.vue | Map: props (title, code, copy labels) -> bar (three dots, title, copy button) -> body (plain code or default slot) -> copy -->
<script setup lang="ts">
/**
 * Window frame around code with a copy button (same markup as packages/ui/snippets/code-window.html).
 * `code` is shown in pre.oc-code-window__body and copied; the default slot (e.g. an .oc-code-block) replaces the body
 * and its text is copied. Classes: .oc-code-window(--dark), __bar, __title, __body, .oc-code-copy(.is-copied)
 */
import { onBeforeUnmount, ref } from 'vue'

const props = withDefaults(
  defineProps<{ title?: string; code?: string; copy?: boolean; copyLabel?: string; copiedLabel?: string; dark?: boolean }>(),
  { copy: true, copyLabel: 'Copy', copiedLabel: 'Copied' },
)
const body = ref<HTMLElement | null>(null)
const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
onBeforeUnmount(() => clearTimeout(timer))

async function onCopy() {
  const text = props.code ?? body.value?.textContent ?? ''
  try { await navigator.clipboard?.writeText(text) } catch { /* no clipboard access */ }
  copied.value = true
  clearTimeout(timer)
  timer = setTimeout(() => (copied.value = false), 1500)
}
</script>

<template>
  <div :class="['oc-code-window', dark && 'oc-code-window--dark']">
    <div class="oc-code-window__bar">
      <i></i><i></i><i></i>
      <span v-if="title" class="oc-code-window__title">{{ title }}</span>
      <button v-if="copy" type="button" :class="['oc-code-copy', copied && 'is-copied']" @click="onCopy">{{ copied ? copiedLabel : copyLabel }}</button>
    </div>
    <div v-if="$slots.default" ref="body"><slot /></div>
    <pre v-else class="oc-code-window__body"><code>{{ code }}</code></pre>
  </div>
</template>
