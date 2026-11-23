<!-- File: packages/vue/src/components/OcPaper.vue | Map: props -> class list in snippet order -> element (as) with the default slot -->
<script setup lang="ts">
/**
 * Off-white paper surface (snippets/paper.html). Props: as, tone (bright|ivory|gray|kraft), sheet, smooth, lined, margin,
 * squares (--grid), dots, mm, edge (torn|torn-top|torn-both|zigzag), holes, fold, stack, theme (.oc-paper-theme).
 * Wrap a sheet with a cut edge in OcPaperLift for a shadow that follows the edge.
 */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    as?: 'div' | 'section' | 'article' | 'aside' | 'main'
    tone?: 'bright' | 'ivory' | 'gray' | 'kraft'
    sheet?: boolean
    smooth?: boolean
    lined?: boolean
    margin?: boolean
    squares?: boolean
    dots?: boolean
    mm?: boolean
    edge?: 'torn' | 'torn-top' | 'torn-both' | 'zigzag'
    holes?: boolean
    fold?: boolean
    stack?: boolean
    theme?: boolean
  }>(),
  { as: 'div' },
)
const classes = computed(() => [
  props.theme && 'oc-paper-theme',
  'oc-paper',
  props.tone && `oc-paper--${props.tone}`,
  props.sheet && 'oc-paper--sheet',
  props.smooth && 'oc-paper--smooth',
  props.lined && 'oc-paper--lined',
  props.margin && 'oc-paper--margin',
  props.squares && 'oc-paper--grid',
  props.dots && 'oc-paper--dots',
  props.mm && 'oc-paper--mm',
  props.edge && `oc-paper--${props.edge}`,
  props.holes && 'oc-paper--holes',
  props.fold && 'oc-paper--fold',
  props.stack && 'oc-paper--stack',
])
</script>

<template>
  <component :is="as" :class="classes"><slot /></component>
</template>
