<!-- File: packages/vue/src/components/OcCallout.vue | Map: card row -> text (default slot) -> action (slot) -->
<script setup lang="ts">
/** Small card with a text on the left (default slot) and an action on the right (slot `action`). */
</script>

<template>
  <div class="oc-callout">
    <div class="oc-callout__text"><slot /></div>
    <div v-if="$slots.action" class="oc-callout__action"><slot name="action" /></div>
  </div>
</template>
