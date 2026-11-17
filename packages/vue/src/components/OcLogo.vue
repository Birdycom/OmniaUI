<!-- File: packages/vue/src/components/OcLogo.vue | Map: props -> measure once (packages/ui/src/logo.js) -> span.oc-logo[data-plate] + img -->
<script setup lang="ts">
/**
 * A customer logo in its own colors and ratio, never filtered. plate="auto" (default) measures the image once and adds a
 * neutral plate only in the theme where the logo would disappear; or set "light" | "dark" | "both" | "none".
 * fit: "contain" (own ratio) or "box" (same box for every logo). height / max-width: CSS lengths.
 */
import { computed, ref, watchEffect } from 'vue'
import { measureLogo } from '../../../ui/src/logo.js'

type Plate = 'light' | 'dark' | 'both' | 'none'
const props = withDefaults(
  defineProps<{ src: string; alt: string; fit?: 'contain' | 'box'; plate?: Plate | 'auto'; height?: string; maxWidth?: string }>(),
  { fit: 'contain', plate: 'auto' },
)
const found = ref<Plate | 'auto'>(props.plate)
watchEffect((onCleanup) => {
  if (props.plate !== 'auto' || !props.src) {
    found.value = props.plate
    return
  }
  let live = true
  onCleanup(() => { live = false })
  void measureLogo(props.src).then((p: Plate) => { if (live) found.value = p })
})
const style = computed(() => ({ ...(props.height ? { '--oc-logo-h': props.height } : {}), ...(props.maxWidth ? { '--oc-logo-w': props.maxWidth } : {}) }))
</script>

<template>
  <span :class="['oc-logo', fit === 'box' && 'oc-logo--box']" :data-plate="found" :style="style">
    <img :src="src" :alt="alt" />
  </span>
</template>
