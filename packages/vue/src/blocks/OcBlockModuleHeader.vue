<script setup lang="ts">
/**
 * Page header with icon tile, title, intro, meta badges and an action row.
 * headingLevel 2 renders the title as h2 (same look). Slots: icon, eyebrow, meta (badges), actions. Classes: .oc-block-modulehead, -band, -icon, -body, -eyebrow, -title, -intro, -meta, -actions
 * 0.17.0: eyebrow (small line above the title), module (data-module: band tint and icon tile), fixedHeight (one band height,
 * --oc-modulehead-height, .oc-block-modulehead--fixed).
 */
withDefaults(defineProps<{ title: string; intro?: string; headingLevel?: 1 | 2; eyebrow?: string; module?: string; fixedHeight?: boolean }>(), { headingLevel: 1 })
</script>

<template>
  <header :class="['oc-block-modulehead', fixedHeight && 'oc-block-modulehead--fixed']" :data-module="module || undefined">
    <div class="oc-block-modulehead-band">
      <span v-if="$slots.icon" class="oc-block-modulehead-icon" aria-hidden="true"><slot name="icon" /></span>
      <div class="oc-block-modulehead-body">
        <p v-if="eyebrow || $slots.eyebrow" class="oc-block-modulehead-eyebrow"><slot name="eyebrow">{{ eyebrow }}</slot></p>
        <component :is="headingLevel === 2 ? 'h2' : 'h1'" class="oc-block-modulehead-title">{{ title }}</component>
        <p v-if="intro" class="oc-block-modulehead-intro">{{ intro }}</p>
        <div v-if="$slots.meta" class="oc-block-modulehead-meta"><slot name="meta" /></div>
      </div>
    </div>
    <div v-if="$slots.actions" class="oc-block-modulehead-actions"><slot name="actions" /></div>
  </header>
</template>
