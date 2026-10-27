<script setup lang="ts">
/** One accordion section (details/summary). v-model:open; default slot = content, `title` prop or slot = trigger. */
import { inject } from 'vue'

defineProps<{ title?: string }>()
const open = defineModel<boolean>('open', { default: false })
const name = inject<string | undefined>('oc-accordion-name', undefined)

function onToggle(e: Event) {
  open.value = (e.target as HTMLDetailsElement).open
}
</script>

<template>
  <details class="oc-accordion-item" :name="name" :open="open" @toggle="onToggle">
    <summary class="oc-accordion-trigger"><slot name="title">{{ title }}</slot></summary>
    <div class="oc-accordion-content"><slot /></div>
  </details>
</template>
