<script setup lang="ts">
/** Exclusive accordion on <details name>. Put OcAccordionItem children inside; they share one group name.
 *  multiple: no group name, so several items can be open together. flush: no outer border or radius (.oc-accordion--flush). */
import { provide } from 'vue'
import { useUid } from '../composables/useUid'

const props = defineProps<{ name?: string; multiple?: boolean; flush?: boolean }>()
const uid = useUid('oc-accordion')
provide('oc-accordion-name', props.multiple ? undefined : props.name ?? uid)
</script>

<template>
  <div :class="['oc-accordion', flush && 'oc-accordion--flush']"><slot /></div>
</template>
