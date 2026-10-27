<script setup lang="ts">
/**
 * Aspect-ratio box. `ratio` is a preset (square | photo | portrait | wide), a number (1.5) or a CSS ratio ("5 / 2");
 * default 16 / 9. `center` centers the content. Classes: .oc-aspect(--square/--photo/--portrait/--wide/--center), --oc-aspect
 */
import { computed } from 'vue'

const presets = ['square', 'photo', 'portrait', 'wide']
const props = defineProps<{ ratio?: 'square' | 'photo' | 'portrait' | 'wide' | number | string; center?: boolean }>()
const preset = computed(() => (typeof props.ratio === 'string' && presets.includes(props.ratio) ? props.ratio : undefined))
const custom = computed(() => (props.ratio !== undefined && !preset.value ? String(props.ratio) : undefined))
</script>

<template>
  <div
    :class="['oc-aspect', preset && `oc-aspect--${preset}`, center && 'oc-aspect--center']"
    :style="custom ? { '--oc-aspect': custom } : undefined"
  >
    <slot />
  </div>
</template>
