<!-- File: packages/vue/src/components/OcRibbon.vue | Map: corner, tone, size -> classes -> band with the slot -->
<script setup lang="ts">
/** Diagonal band across a corner of its parent (same markup as snippets/ribbon.html). Default slot = the text. */
withDefaults(defineProps<{ corner?: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'; tone?: 'primary' | 'success' | 'warning' | 'destructive' | 'muted'; size?: 'sm' | 'md' | 'lg' }>(), { corner: 'top-end', tone: 'primary', size: 'md' })
</script>

<template>
  <span :class="['oc-ribbon', corner !== 'top-end' && `oc-ribbon--${corner}`, tone !== 'primary' && `oc-ribbon--${tone}`, size !== 'md' && `oc-ribbon--${size}`]"><slot /></span>
</template>
