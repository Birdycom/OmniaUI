<!-- File: packages/vue/src/components/OcLiveFrame.vue | Map: props (src, title, width, height, static, inert, device) -> div.oc-live-frame -> iframe and/or slot -->
<script setup lang="ts">
/**
 * A live page at a virtual size (default 1280x720), scaled down to the frame width in pure CSS. Without src the slot
 * goes in (an <img>, <video> or .oc-live-frame__content); with src the slot comes after the iframe (a watermark on top). Classes: .oc-live-frame, --static, --phone, --tv, --laptop,
 * .oc-browser-frame__view. inert: only to look at (no focus, no clicks, hidden from screen readers).
 * device: "phone" (390 x 844 unless width/height are set), "tv" or "laptop" (1440 x 900, with a base). Event frame-load;
 * exposed ref `frame` (postMessage).
 */
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{ src?: string; title?: string; width?: number; height?: number; static?: boolean; inert?: boolean; device?: 'phone' | 'tv' | 'laptop'; inBrowserFrame?: boolean }>(),
  { title: '', static: false, inert: false, inBrowserFrame: false },
)
defineEmits<{ 'frame-load': [event: Event] }>()
const frame = ref<HTMLIFrameElement | null>(null)
defineExpose({ frame })
const w = computed(() => props.width ?? (props.device === 'phone' ? 390 : props.device === 'laptop' ? 1440 : 1280))
const h = computed(() => props.height ?? (props.device === 'phone' ? 844 : props.device === 'laptop' ? 900 : 720))
</script>

<template>
  <div
    :class="[inBrowserFrame && 'oc-browser-frame__view', 'oc-live-frame', static && 'oc-live-frame--static', device && `oc-live-frame--${device}`]"
    :style="{ '--oc-live-w': w, '--oc-live-h': h }"
  >
    <iframe
      v-if="src"
      ref="frame"
      :src="src"
      :title="title"
      loading="lazy"
      scrolling="no"
      :tabindex="static || inert ? -1 : undefined"
      :inert="inert || undefined"
      :aria-hidden="inert ? 'true' : undefined"
      @load="$emit('frame-load', $event)"
    />
    <slot />
  </div>
</template>
