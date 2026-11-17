<!-- File: packages/vue/src/components/OcCodePlate.vue | Map: props -> figure.oc-code-plate (slot: the code) -> caption on the plate -->
<script setup lang="ts">
/**
 * A QR code or barcode (default slot) on its own white plate with a caption on the plate (also on a photo or print).
 * Props: caption, mode (test | live | both: caption colors; "both" without caption shows the two words), size (sm | md).
 * Slot `caption` replaces the caption text.
 */
withDefaults(defineProps<{ caption?: string; mode?: 'test' | 'live' | 'both'; size?: 'sm' | 'md'; labels?: { test?: string; live?: string } }>(), { size: 'md' })
</script>

<template>
  <figure :class="['oc-code-plate', size === 'sm' && 'oc-code-plate--sm']" :data-mode="mode">
    <slot />
    <figcaption v-if="caption || mode === 'both' || $slots.caption" class="oc-code-plate__caption">
      <slot name="caption">
        <template v-if="!caption && mode === 'both'"><span>{{ labels?.test ?? 'Test' }}</span><span>{{ labels?.live ?? 'Live' }}</span></template>
        <template v-else>{{ caption }}</template>
      </slot>
    </figcaption>
  </figure>
</template>
