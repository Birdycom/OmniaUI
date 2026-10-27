<!-- File: packages/vue/src/components/OcTerminalLog.vue | Map: props -> frame -> bar (dots, title, status) -> body (lines + prompt) -> auto-scroll -->
<script setup lang="ts">
/**
 * Dark console window (same markup as snippets/terminal-log.html).
 * Props: lines ({ level: info|success|warn|error|debug, message, time?, label? }[]), title, status ("Live" + pulsing dot),
 * prompt (text, or true for an empty prompt with cursor), height (max body height), autoScroll (default true), label.
 * Classes: .oc-terminal-log, __bar, __title, __status, __body, __line(--info/--success/--warn/--error/--debug), __time, __level, __msg, __prompt
 */
import { nextTick, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    lines: { level: 'info' | 'success' | 'warn' | 'error' | 'debug'; message: string; time?: string; label?: string }[]
    title?: string
    status?: string
    prompt?: string | boolean
    height?: string
    autoScroll?: boolean
    label?: string
  }>(),
  { autoScroll: true, label: 'Log output', prompt: false },
)
const body = ref<HTMLDivElement | null>(null)
// Keep the newest line in view.
watch(
  () => props.lines.length,
  async () => {
    await nextTick()
    if (props.autoScroll && body.value) body.value.scrollTop = body.value.scrollHeight
  },
)
</script>

<template>
  <div class="oc-terminal-log" :style="height ? { '--oc-terminal-log-height': height } : undefined">
    <div class="oc-terminal-log__bar">
      <i /><i /><i />
      <span v-if="title" class="oc-terminal-log__title">{{ title }}</span>
      <span v-if="status" class="oc-terminal-log__status">{{ status }}</span>
    </div>
    <div ref="body" class="oc-terminal-log__body" role="log" aria-live="polite" :aria-label="label" tabindex="0">
      <p v-for="(l, i) in lines" :key="i" :class="['oc-terminal-log__line', `oc-terminal-log__line--${l.level}`]">
        <time v-if="l.time" class="oc-terminal-log__time">{{ l.time }}</time>
        <span class="oc-terminal-log__level">{{ l.label ?? (l.level === 'success' ? 'ok' : l.level) }}</span>
        <span class="oc-terminal-log__msg">{{ l.message }}</span>
      </p>
      <p v-if="prompt !== false" class="oc-terminal-log__prompt">{{ prompt === true ? '' : prompt }}</p>
    </div>
  </div>
</template>
