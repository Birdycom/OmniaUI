<script setup lang="ts">
/** Expandable sidebar item (details). v-model:open. Slots: icon, label (or `label` prop), default (sub items as <li>). */
defineProps<{ label?: string }>()
const open = defineModel<boolean>('open', { default: false })

function onToggle(e: Event) {
  open.value = (e.target as HTMLDetailsElement).open
}
</script>

<template>
  <details class="oc-sidebar-collapsible" :open="open" @toggle="onToggle">
    <summary class="oc-sidebar-menu-button">
      <slot name="icon" />
      <span class="oc-sidebar-menu-label"><slot name="label">{{ label }}</slot></span>
    </summary>
    <ul class="oc-sidebar-menu-sub"><slot /></ul>
  </details>
</template>
