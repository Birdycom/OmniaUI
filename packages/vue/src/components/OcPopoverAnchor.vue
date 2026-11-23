<script setup lang="ts">
/**
 * Anchor of the compound OcPopover (0.17.0): OcPopoverContent is positioned against this element instead of the trigger
 * (CSS anchor-name + position-anchor; a getBoundingClientRect fallback where the browser has no anchor positioning).
 */
import { inject, onBeforeUnmount, onMounted, ref } from 'vue'
import { popoverKey } from '../composables/keys-d3'

const ctx = inject(popoverKey, null)
const el = ref<HTMLElement | null>(null)
onMounted(() => {
  if (!ctx) return
  ctx.anchored.value = true
  ctx.anchorEl.value = el.value
})
onBeforeUnmount(() => {
  if (!ctx) return
  ctx.anchored.value = false
  ctx.anchorEl.value = null
})
</script>

<template>
  <div ref="el" data-oc-popover-anchor="" :style="ctx ? { anchorName: ctx.anchorName } : undefined"><slot /></div>
</template>
