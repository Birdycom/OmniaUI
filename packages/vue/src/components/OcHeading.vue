<script setup lang="ts">
/** Page or section title with a muted description. Classes: .oc-heading(--sm). `as` picks the title tag. */
withDefaults(
  defineProps<{
    title?: string
    description?: string
    size?: 'sm' | 'md'
    as?: 'h1' | 'h2' | 'h3' | 'h4'
  }>(),
  { size: 'md', as: 'h2' },
)
</script>

<template>
  <div :class="['oc-heading', size === 'sm' && 'oc-heading--sm']">
    <component :is="as" class="oc-heading-title"><slot name="title">{{ title }}</slot></component>
    <p v-if="description || $slots.default" class="oc-heading-description"><slot>{{ description }}</slot></p>
  </div>
</template>
