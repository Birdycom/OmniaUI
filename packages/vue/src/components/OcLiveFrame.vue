<!-- File: packages/vue/src/components/OcLiveFrame.vue | Map: props (src, title, width, height, static) -> div.oc-live-frame -> iframe or slot -->
<script setup lang="ts">
/**
 * A live page at a virtual size (default 1280x720), scaled down to the frame width in pure CSS. Without src the slot
 * goes in (an <img>, <video> or .oc-live-frame__content). Classes: .oc-live-frame, --static, .oc-browser-frame__view
 */
withDefaults(
  defineProps<{ src?: string; title?: string; width?: number; height?: number; static?: boolean; inBrowserFrame?: boolean }>(),
  { title: '', width: 1280, height: 720, static: false, inBrowserFrame: false },
)
</script>

<template>
  <div
    :class="[inBrowserFrame && 'oc-browser-frame__view', 'oc-live-frame', static && 'oc-live-frame--static']"
    :style="{ '--oc-live-w': width, '--oc-live-h': height }"
  >
    <iframe v-if="src" :src="src" :title="title" loading="lazy" scrolling="no" :tabindex="static ? -1 : undefined" />
    <slot v-else />
  </div>
</template>
