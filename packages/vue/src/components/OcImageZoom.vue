<!-- File: packages/vue/src/components/OcImageZoom.vue | Map: props + v-model:zoom -> toolbar (radio levels) -> viewport -> canvas -->
<script setup lang="ts">
/**
 * Zoom / pan viewport (same markup as snippets/image-zoom.html). v-model:zoom = current level (default 1).
 * levels: toolbar values (default [1, 1.5, 2, 3]; [] = no toolbar). ratio: square | photo | CSS ratio.
 * Default slot replaces the <img>. Classes: .oc-image-zoom(--square/--photo), __toolbar, __label, __level, __viewport, __canvas
 */
import { computed } from 'vue'
import { useUid } from '../composables/useUid'

const props = withDefaults(defineProps<{ src?: string; alt?: string; levels?: number[]; ratio?: string }>(), {
  alt: '',
  levels: () => [1, 1.5, 2, 3],
})
const zoom = defineModel<number>('zoom', { default: 1 })
const name = useUid('oc-zoom')
const preset = computed(() => (props.ratio === 'square' || props.ratio === 'photo' ? props.ratio : undefined))
// Writing --oc-zoom inline means any level works, not only the ones the CSS :has() rules know.
const vars = computed(() => ({ '--oc-zoom': String(zoom.value), ...(props.ratio && !preset.value ? { '--oc-image-zoom-ratio': props.ratio } : {}) }))
</script>

<template>
  <div :class="['oc-image-zoom', preset && `oc-image-zoom--${preset}`]" :style="vars">
    <div v-if="levels.length" class="oc-image-zoom__toolbar" role="radiogroup" aria-label="Zoom level">
      <span class="oc-image-zoom__label">Zoom</span>
      <label v-for="l in levels" :key="l" class="oc-image-zoom__level">
        <input v-model="zoom" type="radio" :name="name" :value="l" />{{ Math.round(l * 100) }}%
      </label>
    </div>
    <div class="oc-image-zoom__viewport" tabindex="0" role="region" :aria-label="alt ? `${alt}, scroll to pan` : 'Scroll to pan'">
      <div class="oc-image-zoom__canvas">
        <slot>
          <img v-if="src" :src="src" :alt="alt" />
          <div v-else class="oc-media-art" role="img" :aria-label="alt" />
        </slot>
      </div>
    </div>
  </div>
</template>
