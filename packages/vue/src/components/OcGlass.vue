<!-- File: packages/vue/src/components/OcGlass.vue | Map: props (strong, flat, as) -> .oc-glass sheet -> default slot -->
<script setup lang="ts">
/** See-through glass sheet with a light top edge; .oc-card inside becomes a glass panel.
 *  Classes: .oc-glass + --strong, --flat (desktop window where the OS draws the blur) */
withDefaults(defineProps<{ strong?: boolean; flat?: boolean; as?: 'div' | 'section' | 'aside' | 'article' | 'main' }>(), { as: 'div' })
</script>

<template>
  <component :is="as" :class="['oc-glass', strong && 'oc-glass--strong', flat && 'oc-glass--flat']"><slot /></component>
</template>
