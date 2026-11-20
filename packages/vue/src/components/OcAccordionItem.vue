<script setup lang="ts">
/** One accordion section (details/summary). v-model:open; default slot = content, `title` prop or slot = trigger.
 *  Script-controlled (0.17.0): bind `expanded` (v-model:expanded, or :expanded + @update:expanded) and the item becomes
 *  div.oc-accordion-item (.is-open) with a <button> trigger, for state in your own code; `disabled` dims that trigger. */
import { inject } from 'vue'

defineProps<{ title?: string; disabled?: boolean }>()
const open = defineModel<boolean>('open', { default: false })
const expanded = defineModel<boolean | undefined>('expanded', { default: undefined })
const name = inject<string | undefined>('oc-accordion-name', undefined)

function onToggle(e: Event) {
  open.value = (e.target as HTMLDetailsElement).open
}
</script>

<template>
  <div v-if="expanded !== undefined" :class="['oc-accordion-item', expanded && 'is-open']">
    <button
      type="button"
      class="oc-accordion-trigger"
      :disabled="disabled"
      :aria-expanded="disabled ? undefined : expanded"
      @click="expanded = !expanded"
    >
      <slot name="title">{{ title }}</slot>
    </button>
    <div class="oc-accordion-content"><slot /></div>
  </div>
  <details v-else class="oc-accordion-item" :name="name" :open="open" @toggle="onToggle">
    <summary class="oc-accordion-trigger"><slot name="title">{{ title }}</slot></summary>
    <div class="oc-accordion-content"><slot /></div>
  </details>
</template>
