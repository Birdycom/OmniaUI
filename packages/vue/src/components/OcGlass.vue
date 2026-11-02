<!-- File: packages/vue/src/components/OcGlass.vue | Map: props (strong, flat, liquid, as) -> .oc-glass sheet -> default slot -->
<script setup lang="ts">
/** See-through glass sheet with a light top edge; .oc-card inside becomes a glass panel.
 *  Classes: .oc-glass + --strong, --flat (desktop window where the OS draws the blur), --liquid (liquid glass) */
withDefaults(defineProps<{ strong?: boolean; flat?: boolean; liquid?: boolean; as?: 'div' | 'section' | 'aside' | 'article' | 'main' }>(), { as: 'div' })
</script>

<template>
  <component :is="as" :class="['oc-glass', strong && 'oc-glass--strong', flat && 'oc-glass--flat', liquid && 'oc-glass--liquid']"><slot /></component>
</template>
