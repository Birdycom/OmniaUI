<!-- File: packages/vue/src/components/OcFormSection.vue | Map: props -> details (summary: icon, heading, status) -> fields slot -->
<script setup lang="ts">
/** Collapsible form section. Slots: icon, status, default (the fields). Same `name` on siblings = one open at a time. */
withDefaults(defineProps<{ title: string; hint?: string; name?: string; open?: boolean }>(), { open: false })
</script>

<template>
  <details class="oc-form-section" :name="name" :open="open">
    <summary class="oc-form-section__summary">
      <span class="oc-form-section__icon"><slot name="icon" /></span>
      <span class="oc-form-section__heading">
        <span class="oc-form-section__title">{{ title }}</span>
        <span v-if="hint" class="oc-form-section__hint">{{ hint }}</span>
      </span>
      <span class="oc-form-section__status"><slot name="status" /></span>
    </summary>
    <div class="oc-form-section__body"><slot /></div>
  </details>
</template>
