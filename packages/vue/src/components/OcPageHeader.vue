<!-- File: packages/vue/src/components/OcPageHeader.vue | Map: header -> back slot -> main (text: title, subtitle, meta slot | actions slot) -->
<script setup lang="ts">
/**
 * Title row of an app page (size container: actions sit next to the title from a 36rem header width).
 * Slots: back, title, subtitle, meta, actions.
 * Classes: .oc-page-header(--bordered/--sticky/--sm), -back, -main, -text, -title, -subtitle, -meta, -actions
 */
withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    /** Heading level of the title (default 1). */
    level?: 1 | 2 | 3
    bordered?: boolean
    sticky?: boolean
    size?: 'sm'
  }>(),
  { level: 1 },
)
</script>

<template>
  <header :class="['oc-page-header', bordered && 'oc-page-header--bordered', sticky && 'oc-page-header--sticky', size && `oc-page-header--${size}`]">
    <div v-if="$slots.back" class="oc-page-header-back"><slot name="back" /></div>
    <div class="oc-page-header-main">
      <div class="oc-page-header-text">
        <component :is="`h${level}`" class="oc-page-header-title"><slot name="title">{{ title }}</slot></component>
        <p v-if="$slots.subtitle || subtitle" class="oc-page-header-subtitle"><slot name="subtitle">{{ subtitle }}</slot></p>
        <div v-if="$slots.meta" class="oc-page-header-meta"><slot name="meta" /></div>
      </div>
      <div v-if="$slots.actions" class="oc-page-header-actions"><slot name="actions" /></div>
    </div>
  </header>
</template>
