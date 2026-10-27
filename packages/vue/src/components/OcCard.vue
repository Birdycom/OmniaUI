<script setup lang="ts">
/**
 * Card with header, content and footer.
 * Slots: header (replaces title/description), default (content), footer. Classes: .oc-card--sm
 */
withDefaults(defineProps<{ title?: string; description?: string; size?: 'sm' | 'md' }>(), { size: 'md' })
</script>

<template>
  <div :class="['oc-card', size === 'sm' && 'oc-card--sm']">
    <div v-if="title || description || $slots.header" class="oc-card-header">
      <slot name="header">
        <h3 v-if="title" class="oc-card-title">{{ title }}</h3>
        <p v-if="description" class="oc-card-description">{{ description }}</p>
      </slot>
    </div>
    <div v-if="$slots.default" class="oc-card-content"><slot /></div>
    <div v-if="$slots.footer" class="oc-card-footer"><slot name="footer" /></div>
  </div>
</template>
