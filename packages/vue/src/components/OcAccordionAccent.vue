<!-- File: packages/vue/src/components/OcAccordionAccent.vue | Map: div.oc-accordion.oc-accordion--accent (+ color classes) -> OcAccordionItem children -->
<script setup lang="ts">
/**
 * Accent accordion: separate item cards with a colored start edge. Put OcAccordionItem children inside;
 * they share one group name (like OcAccordion). Color one item with class "oc-accent--violet" or "oc-accordion-item--warning".
 * Classes: .oc-accordion--accent, .oc-accent--*, .oc-accordion--success/--warning/--danger, .oc-accordion--flush, .oc-accordion-accent-meta
 */
import { provide } from 'vue'
import { useUid } from '../composables/useUid'

const props = defineProps<{
  name?: string
  /** Color preset for all items. */
  accent?: 'blue' | 'cyan' | 'green' | 'orange' | 'red' | 'violet' | 'yellow'
  /** Semantic color for all items. */
  tone?: 'success' | 'warning' | 'danger'
  flush?: boolean
}>()
// Same key as OcAccordion, so OcAccordionItem picks up the group name.
provide('oc-accordion-name', props.name ?? useUid('oc-accordion'))
</script>

<template>
  <div :class="['oc-accordion', 'oc-accordion--accent', flush && 'oc-accordion--flush', accent && `oc-accent--${accent}`, tone && `oc-accordion--${tone}`]">
    <slot />
  </div>
</template>
