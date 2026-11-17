<script setup lang="ts">
/** Card-style details/summary section. v-model:open. Slots: icon, title, default (content). Classes: --dense, --plain (no card) */
defineProps<{ title?: string; dense?: boolean; plain?: boolean }>()
const open = defineModel<boolean>('open', { default: false })

function onToggle(e: Event) {
  open.value = (e.target as HTMLDetailsElement).open
}
</script>

<template>
  <details :class="['oc-collapsible', dense && 'oc-collapsible--dense', plain && 'oc-collapsible--plain']" :open="open" @toggle="onToggle">
    <summary>
      <slot name="icon" />
      <span class="oc-collapsible-title"><slot name="title">{{ title }}</slot></span>
    </summary>
    <div class="oc-collapsible-content"><slot /></div>
  </details>
</template>
