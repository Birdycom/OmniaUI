<!-- File: packages/vue/src/components/OcResult.vue | Map: tile (icon) -> title -> text (slot) -> actions (slot) -->
<script setup lang="ts">
/** Outcome of an action in place of the form (snippets/result.html). icon = webicon name; slots: default (text), icon, actions. */
defineProps<{ title: string; icon?: string; accent?: string; center?: boolean }>()
</script>

<template>
  <div :class="['oc-result', center && 'oc-result--center']" role="status" tabindex="-1">
    <span v-if="icon || $slots.icon" :class="['oc-icon-tile oc-icon-tile--sm', accent && `oc-accent--${accent}`]" aria-hidden="true">
      <slot name="icon"><iconify-icon :icon="icon" /></slot>
    </span>
    <h2 class="oc-result__title">{{ title }}</h2>
    <p v-if="$slots.default" class="oc-result__text"><slot /></p>
    <div v-if="$slots.actions" class="oc-result__actions"><slot name="actions" /></div>
  </div>
</template>
