<script setup lang="ts">
/**
 * Page header with icon tile, title, intro, meta badges and an action row.
 * Slots: icon, meta (badges), actions. Classes: .oc-block-modulehead, -band, -icon, -body, -title, -intro, -meta, -actions
 */
defineProps<{ title: string; intro?: string }>()
</script>

<template>
  <header class="oc-block-modulehead">
    <div class="oc-block-modulehead-band">
      <span v-if="$slots.icon" class="oc-block-modulehead-icon" aria-hidden="true"><slot name="icon" /></span>
      <div class="oc-block-modulehead-body">
        <h1 class="oc-block-modulehead-title">{{ title }}</h1>
        <p v-if="intro" class="oc-block-modulehead-intro">{{ intro }}</p>
        <div v-if="$slots.meta" class="oc-block-modulehead-meta"><slot name="meta" /></div>
      </div>
    </div>
    <div v-if="$slots.actions" class="oc-block-modulehead-actions"><slot name="actions" /></div>
  </header>
</template>
