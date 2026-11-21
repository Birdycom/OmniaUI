<!-- File: packages/vue/src/components/OcGlass.vue | Map: props (strong, flat, liquid, lens, draggable, as) -> .oc-glass sheet -> default slot -> glass-lens.js after mount (lens, drag) -->
<script setup lang="ts">
/** See-through glass sheet with a light top edge; .oc-card inside becomes a glass panel.
 *  Classes: .oc-glass + --strong, --flat (desktop window where the OS draws the blur), --liquid (liquid glass).
 *  lens (default true): in Chromium the backdrop bends at the edge (glass-lens.js); elsewhere frosted glass.
 *  draggable: people can move the sheet over its backdrop (mouse, touch, arrow keys, Home), inside its parent. */
import { ref } from 'vue'
import { useGlassDrag, useGlassLens } from '../composables/useGlassLens'

const props = withDefaults(defineProps<{ strong?: boolean; flat?: boolean; liquid?: boolean; lens?: boolean; draggable?: boolean; as?: 'div' | 'section' | 'aside' | 'article' | 'main' }>(), { as: 'div', lens: true, draggable: false })
const root = ref<HTMLElement | null>(null)
useGlassLens(root, () => props.lens && !props.flat)
useGlassDrag(root, () => props.draggable)
</script>

<template>
  <component :is="as" ref="root" :class="['oc-glass', strong && 'oc-glass--strong', flat && 'oc-glass--flat', liquid && 'oc-glass--liquid']" :data-oc-glass-lens="lens ? undefined : 'off'" :data-oc-glass-drag="draggable ? '' : undefined"><slot /></component>
</template>
