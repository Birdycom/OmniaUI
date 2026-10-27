<script setup lang="ts">
/** Exclusive accordion on <details name>. Put OcAccordionItem children inside; they share one group name. */
import { provide } from 'vue'
import { useUid } from '../composables/useUid'

const props = defineProps<{ name?: string }>()
provide('oc-accordion-name', props.name ?? useUid('oc-accordion'))
</script>

<template>
  <div class="oc-accordion"><slot /></div>
</template>
