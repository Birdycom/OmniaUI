<!-- File: packages/vue/src/components/OcCardBand.vue | Map: props -> div.oc-card-band (start slot, title + description, default slot) -->
<script setup lang="ts">
/** The colored band at the top of an accent card (OcCard accent="test"). Slots: start (a badge), default (a status). */
defineProps<{ title?: string; description?: string }>()
</script>

<template>
  <div class="oc-card-band">
    <slot name="start" />
    <p v-if="title || description" class="oc-card-band__title">{{ title }}<small v-if="description">{{ description }}</small></p>
    <slot />
  </div>
</template>
