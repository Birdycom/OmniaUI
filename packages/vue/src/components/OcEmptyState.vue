<script setup lang="ts">
/** Icon, title, text and actions for lists without data. Slots: icon, title, default (text), actions. */
defineProps<{ icon?: string; title?: string; text?: string }>()
</script>

<template>
  <div class="oc-empty">
    <span v-if="icon || $slots.icon" class="oc-empty-icon" aria-hidden="true"><slot name="icon">{{ icon }}</slot></span>
    <h3 v-if="title || $slots.title" class="oc-empty-title"><slot name="title">{{ title }}</slot></h3>
    <p v-if="text || $slots.default" class="oc-empty-text"><slot>{{ text }}</slot></p>
    <div v-if="$slots.actions" class="oc-empty-actions"><slot name="actions" /></div>
  </div>
</template>
