<script setup lang="ts">
/** Compound breadcrumb (0.18.0): the current page (aria-current="page"), not a link. icon: a webicon name before the label. */
import OcWebicon from './OcWebicon.vue'

defineProps<{ icon?: string }>()
</script>

<template>
  <span class="oc-breadcrumb-page" aria-current="page"><OcWebicon v-if="icon" :name="icon" bare fallback="iconify" /><slot /></span>
</template>
