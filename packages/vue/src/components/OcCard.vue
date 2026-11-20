<script setup lang="ts">
/**
 * Card with header, content and footer.
 * Slots: band (an OcCardBand at the top), header (replaces title/description), default (content), footer. Classes: .oc-card--sm
 * accent: a 2px border in a tone or mode (.oc-card--accent[data-tone]); inactive: not in use now (dashed border, calm band).
 * fill: as high as its grid or flex cell, footer at the bottom (.oc-card--fill), for equal cards in a row.
 * footerDivider / footerEnd: a line above the footer / the actions on the end side; footerClass: more classes for the footer.
 * bare: the default slot goes in as it is, without the .oc-card-content wrapper (a media block, a table, your own parts).
 */
withDefaults(
  defineProps<{
    title?: string
    description?: string
    size?: 'sm' | 'md'
    accent?: 'primary' | 'info' | 'success' | 'warning' | 'destructive' | 'test' | 'live'
    inactive?: boolean
    fill?: boolean
    footerDivider?: boolean
    footerEnd?: boolean
    footerClass?: string
    bare?: boolean
  }>(),
  { size: 'md' },
)
</script>

<template>
  <div :class="['oc-card', size === 'sm' && 'oc-card--sm', accent && 'oc-card--accent', fill && 'oc-card--fill']" :data-tone="accent" :data-active="accent && inactive ? 'false' : undefined">
    <slot name="band" />
    <div v-if="title || description || $slots.header" class="oc-card-header">
      <slot name="header">
        <h3 v-if="title" class="oc-card-title">{{ title }}</h3>
        <p v-if="description" class="oc-card-description">{{ description }}</p>
      </slot>
    </div>
    <slot v-if="bare" />
    <div v-else-if="$slots.default" class="oc-card-content"><slot /></div>
    <div
      v-if="$slots.footer"
      :class="['oc-card-footer', footerDivider && 'oc-card-footer--divider', footerEnd && 'oc-card-footer--end', footerClass]"
    ><slot name="footer" /></div>
  </div>
</template>
