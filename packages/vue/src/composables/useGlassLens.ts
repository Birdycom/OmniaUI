// File: packages/vue/src/composables/useGlassLens.ts | Map: watch the element and the switch -> glass-lens.js bind -> clean up -> the same for the optional drag
import { onBeforeUnmount, watch } from 'vue'
import type { Ref } from 'vue'
import { bindGlassDrag, bindGlassLens } from '../../../ui/src/glass-lens.js'

/** Gives the element the glass lens after mount (Chromium; elsewhere frosted glass) and removes it again. */
export function useGlassLens(el: Ref<HTMLElement | null>, on: () => boolean) {
  let stop: (() => void) | undefined
  watch(
    [el, on],
    ([node, enabled]) => {
      stop?.()
      stop = node && enabled ? bindGlassLens(node) : undefined
    },
    { flush: 'post', immediate: true },
  )
  onBeforeUnmount(() => stop?.())
}

/** Makes the element draggable over its backdrop (mouse, touch, arrow keys; clamped to its parent) while `on`. */
export function useGlassDrag(el: Ref<HTMLElement | null>, on: () => boolean) {
  let stop: (() => void) | undefined
  watch(
    [el, on],
    ([node, enabled]) => {
      stop?.()
      stop = node && enabled ? bindGlassDrag(node) : undefined
    },
    { flush: 'post', immediate: true },
  )
  onBeforeUnmount(() => stop?.())
}
