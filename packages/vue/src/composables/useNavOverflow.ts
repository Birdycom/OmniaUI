// File: packages/vue/src/composables/useNavOverflow.ts
// Map: fit rule -> measure the <li> items of a list against its parent nav -> ResizeObserver -> visible count
// Used by OcBlockAppHeader (overflow): the links that do not fit go into a "More" menu. Same rule as nav-overflow.js.

import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Ref } from 'vue'

/** How many items fit: all when their widths (plus gaps) fit in `available`, otherwise as many as fit next to the More button. */
export function fitNavItems(widths: number[], available: number, moreWidth: number, gap = 0): number {
  const total = widths.reduce((sum, w, i) => sum + w + (i ? gap : 0), 0)
  if (total <= available) return widths.length
  let used = moreWidth
  let n = 0
  for (const w of widths) {
    const next = used + gap + w
    if (next > available) break
    used = next
    n++
  }
  return n
}

/**
 * Visible item count of the <ul> in `list`: its <li> items (hidden ones keep their width through [data-oc-hidden]) are
 * measured against the parent nav, the [data-oc-nav-more] item excluded; re-measured on resize and when `count` changes.
 */
export function useNavOverflow(list: Ref<HTMLElement | null>, count: Ref<number>, enabled: Ref<boolean>) {
  const visible = ref(count.value)
  let ro: ResizeObserver | null = null
  const measure = () => {
    const ul = list.value
    const box = ul?.parentElement
    if (!enabled.value || !ul || !box) {
      visible.value = count.value
      return
    }
    const items = [...ul.children].filter((el) => !el.hasAttribute('data-oc-nav-more')) as HTMLElement[]
    const more = ul.querySelector<HTMLElement>('[data-oc-nav-more]')
    const gap = parseFloat(getComputedStyle(ul).columnGap) || 0
    visible.value = Math.min(count.value, fitNavItems(items.map((el) => el.offsetWidth), box.clientWidth, more?.offsetWidth ?? 0, gap))
  }
  onMounted(() => {
    measure()
    const box = list.value?.parentElement
    if (box && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(measure)
      ro.observe(box)
    }
  })
  watch([count, enabled], () => measure(), { flush: 'post' })
  onBeforeUnmount(() => ro?.disconnect())
  return { visible, measure }
}
