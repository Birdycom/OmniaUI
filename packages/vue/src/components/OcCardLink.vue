<script setup lang="ts">
/** A small link in the primary color for a card footer ("Manage members"). Class: .oc-card-link */
defineProps<{ href?: string }>()
</script>

<template>
  <a class="oc-card-link" :href="href"><slot /></a>
</template>
