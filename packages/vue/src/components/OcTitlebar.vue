<!-- File: packages/vue/src/components/OcTitlebar.vue | Map: props (title, subtitle, bordered, size) -> header.oc-titlebar -> __main (icon slot, title, subtitle) -> __actions (default slot) -->
<script setup lang="ts">
/** Drag area of a frameless desktop window (app-region: drag); buttons in it stay clickable.
 *  Slots: icon, title, subtitle, default (the OcTitlebarButton actions).
 *  Classes: .oc-titlebar(--bordered/--sm), __main, __icon, __title, __subtitle, __actions */
withDefaults(defineProps<{ title?: string; subtitle?: string; bordered?: boolean; size?: 'sm' | 'md' }>(), { size: 'md' })
</script>

<template>
  <header :class="['oc-titlebar', bordered && 'oc-titlebar--bordered', size === 'sm' && 'oc-titlebar--sm']">
    <div class="oc-titlebar__main">
      <span v-if="$slots.icon" class="oc-titlebar__icon" aria-hidden="true"><slot name="icon" /></span>
      <span v-if="title || $slots.title" class="oc-titlebar__title"><slot name="title">{{ title }}</slot></span>
      <span v-if="subtitle || $slots.subtitle" class="oc-titlebar__subtitle"><slot name="subtitle">{{ subtitle }}</slot></span>
    </div>
    <div v-if="$slots.default" class="oc-titlebar__actions"><slot /></div>
  </header>
</template>
