<script setup lang="ts">
/** Menu item: <a> with `href`, otherwise <button>. */
defineProps<{ href?: string }>()
</script>

<template>
  <a v-if="href" class="oc-dropdown-item" :href="href"><slot /></a>
  <button v-else class="oc-dropdown-item" type="button"><slot /></button>
</template>
