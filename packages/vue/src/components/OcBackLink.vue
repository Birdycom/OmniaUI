<script setup lang="ts">
/** Outline link that names its destination (Back to Products). */
withDefaults(defineProps<{ href?: string }>(), { href: '#' })
</script>

<template>
  <a class="oc-back-link" :href="href"><slot /></a>
</template>
